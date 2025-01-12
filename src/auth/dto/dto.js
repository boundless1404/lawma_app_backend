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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignInDto = exports.EntityProfileSignUpDto = exports.EntityProfileDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
let EntityProfileDto = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    return _a = class EntityProfileDto {
            constructor() {
                this.name = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _name_initializers, void 0));
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.EntityProfileDto = EntityProfileDto;
let EntityProfileSignUpDto = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _firstName_decorators;
    let _firstName_initializers = [];
    let _middleName_decorators;
    let _middleName_initializers = [];
    let _lastName_decorators;
    let _lastName_initializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _password_decorators;
    let _password_initializers = [];
    let _entityProfile_decorators;
    let _entityProfile_initializers = [];
    return _a = class EntityProfileSignUpDto {
            constructor() {
                this.firstName = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _firstName_initializers, void 0));
                this.middleName = __runInitializers(this, _middleName_initializers, void 0);
                this.lastName = __runInitializers(this, _lastName_initializers, void 0);
                this.email = __runInitializers(this, _email_initializers, void 0);
                this.password = __runInitializers(this, _password_initializers, void 0);
                this.entityProfile = __runInitializers(this, _entityProfile_initializers, void 0);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _firstName_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            _middleName_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _lastName_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _email_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)(), (0, class_validator_1.IsEmail)()];
            _password_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            _entityProfile_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_transformer_1.Type)(() => EntityProfileDto), (0, class_validator_1.ValidateNested)()];
            __esDecorate(null, null, _firstName_decorators, { kind: "field", name: "firstName", static: false, private: false, access: { has: obj => "firstName" in obj, get: obj => obj.firstName, set: (obj, value) => { obj.firstName = value; } }, metadata: _metadata }, _firstName_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _middleName_decorators, { kind: "field", name: "middleName", static: false, private: false, access: { has: obj => "middleName" in obj, get: obj => obj.middleName, set: (obj, value) => { obj.middleName = value; } }, metadata: _metadata }, _middleName_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _lastName_decorators, { kind: "field", name: "lastName", static: false, private: false, access: { has: obj => "lastName" in obj, get: obj => obj.lastName, set: (obj, value) => { obj.lastName = value; } }, metadata: _metadata }, _lastName_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: obj => "password" in obj, get: obj => obj.password, set: (obj, value) => { obj.password = value; } }, metadata: _metadata }, _password_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _entityProfile_decorators, { kind: "field", name: "entityProfile", static: false, private: false, access: { has: obj => "entityProfile" in obj, get: obj => obj.entityProfile, set: (obj, value) => { obj.entityProfile = value; } }, metadata: _metadata }, _entityProfile_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.EntityProfileSignUpDto = EntityProfileSignUpDto;
let SignInDto = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _password_decorators;
    let _password_initializers = [];
    return _a = class SignInDto {
            constructor() {
                this.email = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _email_initializers, void 0));
                // TODO: Implement password policy
                this.password = __runInitializers(this, _password_initializers, void 0);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _email_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsEmail)()];
            _password_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: obj => "password" in obj, get: obj => obj.password, set: (obj, value) => { obj.password = value; } }, metadata: _metadata }, _password_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.SignInDto = SignInDto;
