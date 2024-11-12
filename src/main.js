"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const envs_1 = __importDefault(require("./config/envs"));
const common_1 = require("@nestjs/common");
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = yield core_1.NestFactory.create(app_module_1.AppModule);
        app.enableVersioning({
            type: common_1.VersioningType.URI,
            prefix: 'v1',
        });
        const appName = envs_1.default.PROJECT_NAME || 'Nest Js app';
        const port = process.env.PORT ||
            process.env.HTTP_PORT ||
            process.env.SERVER_PORT ||
            '3000';
        yield app.listen(port);
        common_1.Logger.log('', `${appName} started on port ${port}`);
        // Get the HTTP server instance
        const httpServer = app.getHttpServer();
        // Get the router instance from the HTTP server
        const router = httpServer._events.request._router;
        const availableRoutes = router.stack
            .map((layer) => {
            var _a, _b;
            if (layer.route) {
                return {
                    route: {
                        path: (_a = layer.route) === null || _a === void 0 ? void 0 : _a.path,
                        method: (_b = layer.route) === null || _b === void 0 ? void 0 : _b.stack[0].method,
                    },
                };
            }
        })
            .filter((item) => item !== undefined);
        common_1.Logger.log(availableRoutes, 'Available routes');
    });
}
bootstrap();
