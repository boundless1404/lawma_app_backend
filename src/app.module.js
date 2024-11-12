"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_config_1 = __importDefault(require("./config/envs/app.config"));
const aws_config_1 = __importDefault(require("./config/envs/aws.config"));
const default_1 = __importDefault(require("./config/database/connections/default"));
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const lodash_1 = require("lodash");
const nestjs_pino_1 = require("nestjs-pino");
const helmet_1 = __importDefault(require("helmet"));
const general_1 = require("./config/helpers/general");
const app_service_1 = require("./app.service");
const extractToken_middleware_1 = require("./shared/extractToken.middleware");
const auth_module_1 = require("./auth/auth.module");
const shared_module_1 = require("./shared/shared.module");
const utils_billing_module_1 = require("./utils-billing/utils-billing.module");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require('cors');
const validator = new common_1.ValidationPipe({
    whitelist: false,
    transform: true,
    exceptionFactory(errors) {
        const formattedErrors = errors.reduce((prev, error) => {
            if (!(0, lodash_1.has)(prev, error.property)) {
                prev[error.property] = (0, lodash_1.first)((0, lodash_1.values)(error.constraints || {}));
            }
            return prev;
        }, {});
        return new common_1.BadRequestException({
            type: 'VALIDATION_ERROR',
            errors: formattedErrors,
            message: 'Invalid data',
        }, 'Bad Request');
    },
});
let AppModule = (() => {
    let _classDecorators = [(0, common_1.Module)({
            imports: [
                nestjs_pino_1.LoggerModule.forRootAsync({
                    inject: [app_config_1.default.KEY],
                    useFactory(applicationConfig) {
                        return __awaiter(this, void 0, void 0, function* () {
                            const nodeEnv = applicationConfig.NODE_ENV;
                            return {
                                pinoHttp: {
                                    transport: {
                                        target: 'pino-pretty',
                                        options: nodeEnv === 'production'
                                            ? {
                                                destination: (0, general_1.pathFromRoot)('./logs/pm2/out.log'),
                                                colorize: false,
                                                mkdir: true,
                                                crlf: true,
                                            }
                                            : undefined,
                                    },
                                },
                            };
                        });
                    },
                }),
                config_1.ConfigModule.forRoot({
                    envFilePath: ['.env'],
                    isGlobal: true,
                    load: [app_config_1.default, aws_config_1.default],
                    cache: true,
                }),
                typeorm_1.TypeOrmModule.forRootAsync({
                    name: 'default',
                    useFactory: () => ({}),
                    dataSourceFactory: () => __awaiter(void 0, void 0, void 0, function* () {
                        if (!default_1.default.isInitialized) {
                            default_1.default.setOptions({ entities: ['dist/**/*.entity.js'] });
                            yield default_1.default.initialize();
                        }
                        return default_1.default;
                    }),
                }),
                jwt_1.JwtModule.registerAsync({
                    useFactory(configService) {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield config_1.ConfigModule.envVariablesLoaded;
                            return {
                                signOptions: {
                                    expiresIn: configService.get('app.JWT_EXPIRY', '8h'),
                                },
                                secret: configService.get('app.JWT_SECRET'),
                            };
                        });
                    },
                    inject: [config_1.ConfigService],
                }),
                auth_module_1.AuthModule,
                shared_module_1.SharedModule,
                utils_billing_module_1.UtilsBillingModule,
                AppModule,
            ],
            providers: [
                {
                    provide: core_1.APP_PIPE,
                    useValue: validator,
                },
                jwt_1.JwtService,
                app_service_1.AppService,
            ],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AppModule = _classThis = class {
        configure(consumer) {
            consumer
                .apply(cors(), (0, helmet_1.default)(), extractToken_middleware_1.ExtractTokenMiddleWare)
                .exclude('/auth/*')
                .exclude('')
                .forRoutes('*');
        }
    };
    __setFunctionName(_classThis, "AppModule");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AppModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AppModule = _classThis;
})();
exports.AppModule = AppModule;
