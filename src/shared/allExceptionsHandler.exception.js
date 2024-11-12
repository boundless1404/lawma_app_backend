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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let AllExceptionFilter = (() => {
    let _classDecorators = [(0, common_1.Catch)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AllExceptionFilter = _classThis = class {
        constructor(httpAdapterHost) {
            this.httpAdapterHost = httpAdapterHost;
            //
        }
        catch(exception, host) {
            const { httpAdapter } = this.httpAdapterHost;
            const httpContext = host.switchToHttp();
            const httpStatus = exception instanceof common_1.HttpException
                ? exception.getStatus()
                : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const request = httpContext.getRequest();
            // const responseBody = {
            //     code: httpStatus,
            //     message: '',
            // }
            const responseBody = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ timestamp: new Date().toISOString(), statusCode: httpStatus }, ('message' in exception ? { message: exception.message } : {})), { path: httpAdapter.getRequestUrl(httpContext.getRequest()) }), ('cause' in exception ? { cause: exception.cause } : {})), ('stack' in exception ? { stack: exception.stack } : {})), ('response' in exception ? { response: exception.response } : {}));
            if ([common_1.HttpStatus.BAD_REQUEST, common_1.HttpStatus.INTERNAL_SERVER_ERROR].includes(httpStatus)) {
                common_1.Logger.error(`Execption has been thrown when accessing the path: ${responseBody.path}`, responseBody, { requstBody: Object.assign({}, request.body), requestMethod: request.method });
                delete responseBody.stack;
                httpAdapter.reply(httpContext.getResponse(), responseBody, httpStatus);
            }
            else if ([common_1.HttpStatus.FORBIDDEN, common_1.HttpStatus.UNAUTHORIZED].includes(httpStatus)) {
                common_1.Logger.error(`Execption has been thrown when accessing the path: ${responseBody.path}`, responseBody, { requstBody: Object.assign({}, request.body), requestMethod: request.method });
                delete responseBody.stack;
                delete responseBody.cause;
                httpAdapter.reply(httpContext.getResponse(), responseBody, httpStatus);
            }
            else {
                httpAdapter.reply(httpContext.getResponse(), { message: responseBody.message }, httpStatus);
            }
        }
    };
    __setFunctionName(_classThis, "AllExceptionFilter");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AllExceptionFilter = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AllExceptionFilter = _classThis;
})();
exports.AllExceptionFilter = AllExceptionFilter;
