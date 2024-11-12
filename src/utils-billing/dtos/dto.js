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
exports.UpdateArrearDto = exports.SavePropertyUnitsDto = exports.SavePropertyUnitsDetailsDto = exports.GetBillingAccountArrear = exports.GetPaymentsQuery = exports.GetBillingQuery = exports.GenerateBillingDto = exports.GetSubscriptionQuery = exports.GetPhoneCodesQuery = exports.GetPropertyTypeQuery = exports.GetStreetQuery = exports.GetLgaWardQuery = exports.GetLgaQuery = exports.PostPaymentDto = exports.CreatePropertyTypesDto = exports.CreateLgaWardDto = exports.CreateLgaDto = exports.CreateStreetDto = exports.CreateSubscriptionDto = exports.CreateUserDto = void 0;
const enums_1 = require("@/src/lib/enums");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
let CreateUserDto = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _firstName_decorators;
    let _firstName_initializers = [];
    let _lastName_decorators;
    let _lastName_initializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _password_decorators;
    let _password_initializers = [];
    let _phone_decorators;
    let _phone_initializers = [];
    let _phoneCodeId_decorators;
    let _phoneCodeId_initializers = [];
    let _profileType_decorators;
    let _profileType_initializers = [];
    return _a = class CreateUserDto {
            constructor() {
                this.firstName = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _firstName_initializers, void 0));
                this.lastName = __runInitializers(this, _lastName_initializers, void 0);
                this.email = __runInitializers(this, _email_initializers, void 0);
                this.password = __runInitializers(this, _password_initializers, void 0);
                this.phone = __runInitializers(this, _phone_initializers, void 0);
                this.phoneCodeId = __runInitializers(this, _phoneCodeId_initializers, void 0);
                this.profileType = __runInitializers(this, _profileType_initializers, void 0);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _firstName_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            _lastName_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            _email_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _password_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            _phone_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            _phoneCodeId_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            _profileType_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(enums_1.ProfileTypes)];
            __esDecorate(null, null, _firstName_decorators, { kind: "field", name: "firstName", static: false, private: false, access: { has: obj => "firstName" in obj, get: obj => obj.firstName, set: (obj, value) => { obj.firstName = value; } }, metadata: _metadata }, _firstName_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _lastName_decorators, { kind: "field", name: "lastName", static: false, private: false, access: { has: obj => "lastName" in obj, get: obj => obj.lastName, set: (obj, value) => { obj.lastName = value; } }, metadata: _metadata }, _lastName_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _password_decorators, { kind: "field", name: "password", static: false, private: false, access: { has: obj => "password" in obj, get: obj => obj.password, set: (obj, value) => { obj.password = value; } }, metadata: _metadata }, _password_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: obj => "phone" in obj, get: obj => obj.phone, set: (obj, value) => { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _phoneCodeId_decorators, { kind: "field", name: "phoneCodeId", static: false, private: false, access: { has: obj => "phoneCodeId" in obj, get: obj => obj.phoneCodeId, set: (obj, value) => { obj.phoneCodeId = value; } }, metadata: _metadata }, _phoneCodeId_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _profileType_decorators, { kind: "field", name: "profileType", static: false, private: false, access: { has: obj => "profileType" in obj, get: obj => obj.profileType, set: (obj, value) => { obj.profileType = value; } }, metadata: _metadata }, _profileType_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CreateUserDto = CreateUserDto;
let CreateSubscriptionDto = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _propertyName_decorators;
    let _propertyName_initializers = [];
    let _propertyUnit_decorators;
    let _propertyUnit_initializers = [];
    let _streetId_decorators;
    let _streetId_initializers = [];
    let _streetNumber_decorators;
    let _streetNumber_initializers = [];
    let _propertyTypeId_decorators;
    let _propertyTypeId_initializers = [];
    let _oldCode_decorators;
    let _oldCode_initializers = [];
    let _propertySubscriberProfileId_decorators;
    let _propertySubscriberProfileId_initializers = [];
    let _isOwner_decorators;
    let _isOwner_initializers = [];
    return _a = class CreateSubscriptionDto {
            constructor() {
                this.propertyName = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _propertyName_initializers, void 0));
                this.propertyUnit = __runInitializers(this, _propertyUnit_initializers, void 0);
                this.streetId = __runInitializers(this, _streetId_initializers, void 0);
                this.streetNumber = __runInitializers(this, _streetNumber_initializers, void 0);
                this.propertyTypeId = __runInitializers(this, _propertyTypeId_initializers, void 0);
                this.oldCode = __runInitializers(this, _oldCode_initializers, void 0);
                this.propertySubscriberProfileId = __runInitializers(this, _propertySubscriberProfileId_initializers, void 0);
                this.isOwner = __runInitializers(this, _isOwner_initializers, void 0);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _propertyName_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            _propertyUnit_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsNumber)()];
            _streetId_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsNumberString)()];
            _streetNumber_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            _propertyTypeId_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsNumberString)()];
            _oldCode_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _propertySubscriberProfileId_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsNumberString)()];
            _isOwner_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _propertyName_decorators, { kind: "field", name: "propertyName", static: false, private: false, access: { has: obj => "propertyName" in obj, get: obj => obj.propertyName, set: (obj, value) => { obj.propertyName = value; } }, metadata: _metadata }, _propertyName_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _propertyUnit_decorators, { kind: "field", name: "propertyUnit", static: false, private: false, access: { has: obj => "propertyUnit" in obj, get: obj => obj.propertyUnit, set: (obj, value) => { obj.propertyUnit = value; } }, metadata: _metadata }, _propertyUnit_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _streetId_decorators, { kind: "field", name: "streetId", static: false, private: false, access: { has: obj => "streetId" in obj, get: obj => obj.streetId, set: (obj, value) => { obj.streetId = value; } }, metadata: _metadata }, _streetId_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _streetNumber_decorators, { kind: "field", name: "streetNumber", static: false, private: false, access: { has: obj => "streetNumber" in obj, get: obj => obj.streetNumber, set: (obj, value) => { obj.streetNumber = value; } }, metadata: _metadata }, _streetNumber_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _propertyTypeId_decorators, { kind: "field", name: "propertyTypeId", static: false, private: false, access: { has: obj => "propertyTypeId" in obj, get: obj => obj.propertyTypeId, set: (obj, value) => { obj.propertyTypeId = value; } }, metadata: _metadata }, _propertyTypeId_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _oldCode_decorators, { kind: "field", name: "oldCode", static: false, private: false, access: { has: obj => "oldCode" in obj, get: obj => obj.oldCode, set: (obj, value) => { obj.oldCode = value; } }, metadata: _metadata }, _oldCode_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _propertySubscriberProfileId_decorators, { kind: "field", name: "propertySubscriberProfileId", static: false, private: false, access: { has: obj => "propertySubscriberProfileId" in obj, get: obj => obj.propertySubscriberProfileId, set: (obj, value) => { obj.propertySubscriberProfileId = value; } }, metadata: _metadata }, _propertySubscriberProfileId_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _isOwner_decorators, { kind: "field", name: "isOwner", static: false, private: false, access: { has: obj => "isOwner" in obj, get: obj => obj.isOwner, set: (obj, value) => { obj.isOwner = value; } }, metadata: _metadata }, _isOwner_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CreateSubscriptionDto = CreateSubscriptionDto;
let CreateStreetDto = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _lgaWardId_decorators;
    let _lgaWardId_initializers = [];
    return _a = class CreateStreetDto {
            constructor() {
                this.name = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _name_initializers, void 0));
                // @IsNotEmpty()
                // @IsNumberString()
                // lgaId: string;
                this.lgaWardId = __runInitializers(this, _lgaWardId_initializers, void 0);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            _lgaWardId_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsNumberString)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _lgaWardId_decorators, { kind: "field", name: "lgaWardId", static: false, private: false, access: { has: obj => "lgaWardId" in obj, get: obj => obj.lgaWardId, set: (obj, value) => { obj.lgaWardId = value; } }, metadata: _metadata }, _lgaWardId_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CreateStreetDto = CreateStreetDto;
let CreateLgaDto = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    return _a = class CreateLgaDto {
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
exports.CreateLgaDto = CreateLgaDto;
let CreateLgaWardDto = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _lgaId_decorators;
    let _lgaId_initializers = [];
    return _a = class CreateLgaWardDto {
            constructor() {
                this.name = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _name_initializers, void 0));
                this.lgaId = __runInitializers(this, _lgaId_initializers, void 0);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            _lgaId_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsNumberString)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _lgaId_decorators, { kind: "field", name: "lgaId", static: false, private: false, access: { has: obj => "lgaId" in obj, get: obj => obj.lgaId, set: (obj, value) => { obj.lgaId = value; } }, metadata: _metadata }, _lgaId_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CreateLgaWardDto = CreateLgaWardDto;
let CreatePropertyTypesDto = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _id_decorators;
    let _id_initializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _unitPrice_decorators;
    let _unitPrice_initializers = [];
    return _a = class CreatePropertyTypesDto {
            constructor() {
                this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.unitPrice = __runInitializers(this, _unitPrice_initializers, void 0);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumberString)()];
            _name_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            _unitPrice_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsNumberString)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _unitPrice_decorators, { kind: "field", name: "unitPrice", static: false, private: false, access: { has: obj => "unitPrice" in obj, get: obj => obj.unitPrice, set: (obj, value) => { obj.unitPrice = value; } }, metadata: _metadata }, _unitPrice_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CreatePropertyTypesDto = CreatePropertyTypesDto;
let PostPaymentDto = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _amount_decorators;
    let _amount_initializers = [];
    let _payerName_decorators;
    let _payerName_initializers = [];
    let _comments_decorators;
    let _comments_initializers = [];
    let _propertySubscriptionId_decorators;
    let _propertySubscriptionId_initializers = [];
    let _paymentDate_decorators;
    let _paymentDate_initializers = [];
    return _a = class PostPaymentDto {
            constructor() {
                this.amount = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _amount_initializers, void 0));
                this.payerName = __runInitializers(this, _payerName_initializers, void 0);
                this.comments = __runInitializers(this, _comments_initializers, void 0);
                this.propertySubscriptionId = __runInitializers(this, _propertySubscriptionId_initializers, void 0);
                this.paymentDate = __runInitializers(this, _paymentDate_initializers, void 0);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _amount_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsNumberString)()];
            _payerName_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            _comments_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _propertySubscriptionId_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsNumberString)()];
            _paymentDate_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsDateString)()];
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _payerName_decorators, { kind: "field", name: "payerName", static: false, private: false, access: { has: obj => "payerName" in obj, get: obj => obj.payerName, set: (obj, value) => { obj.payerName = value; } }, metadata: _metadata }, _payerName_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _comments_decorators, { kind: "field", name: "comments", static: false, private: false, access: { has: obj => "comments" in obj, get: obj => obj.comments, set: (obj, value) => { obj.comments = value; } }, metadata: _metadata }, _comments_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _propertySubscriptionId_decorators, { kind: "field", name: "propertySubscriptionId", static: false, private: false, access: { has: obj => "propertySubscriptionId" in obj, get: obj => obj.propertySubscriptionId, set: (obj, value) => { obj.propertySubscriptionId = value; } }, metadata: _metadata }, _propertySubscriptionId_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _paymentDate_decorators, { kind: "field", name: "paymentDate", static: false, private: false, access: { has: obj => "paymentDate" in obj, get: obj => obj.paymentDate, set: (obj, value) => { obj.paymentDate = value; } }, metadata: _metadata }, _paymentDate_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.PostPaymentDto = PostPaymentDto;
let GetLgaQuery = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    return _a = class GetLgaQuery {
            constructor() {
                this.name = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _name_initializers, void 0));
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.GetLgaQuery = GetLgaQuery;
let GetLgaWardQuery = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _lgaId_decorators;
    let _lgaId_initializers = [];
    return _a = class GetLgaWardQuery {
            constructor() {
                this.name = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _name_initializers, void 0));
                this.lgaId = __runInitializers(this, _lgaId_initializers, void 0);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _lgaId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumberString)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _lgaId_decorators, { kind: "field", name: "lgaId", static: false, private: false, access: { has: obj => "lgaId" in obj, get: obj => obj.lgaId, set: (obj, value) => { obj.lgaId = value; } }, metadata: _metadata }, _lgaId_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.GetLgaWardQuery = GetLgaWardQuery;
let GetStreetQuery = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _lgaWardId_decorators;
    let _lgaWardId_initializers = [];
    return _a = class GetStreetQuery {
            constructor() {
                this.name = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _name_initializers, void 0));
                this.lgaWardId = __runInitializers(this, _lgaWardId_initializers, void 0);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _lgaWardId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumberString)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _lgaWardId_decorators, { kind: "field", name: "lgaWardId", static: false, private: false, access: { has: obj => "lgaWardId" in obj, get: obj => obj.lgaWardId, set: (obj, value) => { obj.lgaWardId = value; } }, metadata: _metadata }, _lgaWardId_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.GetStreetQuery = GetStreetQuery;
let GetPropertyTypeQuery = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _unitPrice_decorators;
    let _unitPrice_initializers = [];
    return _a = class GetPropertyTypeQuery {
            constructor() {
                this.name = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _name_initializers, void 0));
                this.unitPrice = __runInitializers(this, _unitPrice_initializers, void 0);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _unitPrice_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumberString)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _unitPrice_decorators, { kind: "field", name: "unitPrice", static: false, private: false, access: { has: obj => "unitPrice" in obj, get: obj => obj.unitPrice, set: (obj, value) => { obj.unitPrice = value; } }, metadata: _metadata }, _unitPrice_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.GetPropertyTypeQuery = GetPropertyTypeQuery;
let GetPhoneCodesQuery = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _id_decorators;
    let _id_initializers = [];
    let _query_decorators;
    let _query_initializers = [];
    return _a = class GetPhoneCodesQuery {
            constructor() {
                this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
                this.query = __runInitializers(this, _query_initializers, void 0);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _query_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _query_decorators, { kind: "field", name: "query", static: false, private: false, access: { has: obj => "query" in obj, get: obj => obj.query, set: (obj, value) => { obj.query = value; } }, metadata: _metadata }, _query_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.GetPhoneCodesQuery = GetPhoneCodesQuery;
let GetSubscriptionQuery = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _rowsPerPage_decorators;
    let _rowsPerPage_initializers = [];
    let _limit_decorators;
    let _limit_initializers = [];
    let _sortBy_decorators;
    let _sortBy_initializers = [];
    let _descending_decorators;
    let _descending_initializers = [];
    let _page_decorators;
    let _page_initializers = [];
    let _filter_decorators;
    let _filter_initializers = [];
    let _streetId_decorators;
    let _streetId_initializers = [];
    return _a = class GetSubscriptionQuery {
            constructor() {
                this.rowsPerPage = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _rowsPerPage_initializers, void 0));
                this.limit = __runInitializers(this, _limit_initializers, void 0);
                this.sortBy = __runInitializers(this, _sortBy_initializers, void 0);
                this.descending = __runInitializers(this, _descending_initializers, void 0);
                this.page = __runInitializers(this, _page_initializers, void 0);
                this.filter = __runInitializers(this, _filter_initializers, void 0);
                this.streetId = __runInitializers(this, _streetId_initializers, void 0);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _rowsPerPage_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumberString)()];
            _limit_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _sortBy_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _descending_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBooleanString)()];
            _page_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumberString)()];
            _filter_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _streetId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumberString)()];
            __esDecorate(null, null, _rowsPerPage_decorators, { kind: "field", name: "rowsPerPage", static: false, private: false, access: { has: obj => "rowsPerPage" in obj, get: obj => obj.rowsPerPage, set: (obj, value) => { obj.rowsPerPage = value; } }, metadata: _metadata }, _rowsPerPage_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _limit_decorators, { kind: "field", name: "limit", static: false, private: false, access: { has: obj => "limit" in obj, get: obj => obj.limit, set: (obj, value) => { obj.limit = value; } }, metadata: _metadata }, _limit_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _sortBy_decorators, { kind: "field", name: "sortBy", static: false, private: false, access: { has: obj => "sortBy" in obj, get: obj => obj.sortBy, set: (obj, value) => { obj.sortBy = value; } }, metadata: _metadata }, _sortBy_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _descending_decorators, { kind: "field", name: "descending", static: false, private: false, access: { has: obj => "descending" in obj, get: obj => obj.descending, set: (obj, value) => { obj.descending = value; } }, metadata: _metadata }, _descending_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _page_decorators, { kind: "field", name: "page", static: false, private: false, access: { has: obj => "page" in obj, get: obj => obj.page, set: (obj, value) => { obj.page = value; } }, metadata: _metadata }, _page_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _filter_decorators, { kind: "field", name: "filter", static: false, private: false, access: { has: obj => "filter" in obj, get: obj => obj.filter, set: (obj, value) => { obj.filter = value; } }, metadata: _metadata }, _filter_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _streetId_decorators, { kind: "field", name: "streetId", static: false, private: false, access: { has: obj => "streetId" in obj, get: obj => obj.streetId, set: (obj, value) => { obj.streetId = value; } }, metadata: _metadata }, _streetId_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.GetSubscriptionQuery = GetSubscriptionQuery;
let GenerateBillingDto = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _streetId_decorators;
    let _streetId_initializers = [];
    let _propertySuscriptionId_decorators;
    let _propertySuscriptionId_initializers = [];
    let _year_decorators;
    let _year_initializers = [];
    let _month_decorators;
    let _month_initializers = [];
    let _forAllProperties_decorators;
    let _forAllProperties_initializers = [];
    let _forPropertiesOnStreet_decorators;
    let _forPropertiesOnStreet_initializers = [];
    return _a = class GenerateBillingDto {
            constructor() {
                this.streetId = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _streetId_initializers, void 0));
                this.propertySuscriptionId = __runInitializers(this, _propertySuscriptionId_initializers, void 0);
                this.year = __runInitializers(this, _year_initializers, void 0);
                this.month = __runInitializers(this, _month_initializers, void 0);
                this.forAllProperties = __runInitializers(this, _forAllProperties_initializers, void 0);
                this.forPropertiesOnStreet = __runInitializers(this, _forPropertiesOnStreet_initializers, void 0);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _streetId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _propertySuscriptionId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _year_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _month_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _forAllProperties_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _forPropertiesOnStreet_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _streetId_decorators, { kind: "field", name: "streetId", static: false, private: false, access: { has: obj => "streetId" in obj, get: obj => obj.streetId, set: (obj, value) => { obj.streetId = value; } }, metadata: _metadata }, _streetId_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _propertySuscriptionId_decorators, { kind: "field", name: "propertySuscriptionId", static: false, private: false, access: { has: obj => "propertySuscriptionId" in obj, get: obj => obj.propertySuscriptionId, set: (obj, value) => { obj.propertySuscriptionId = value; } }, metadata: _metadata }, _propertySuscriptionId_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _year_decorators, { kind: "field", name: "year", static: false, private: false, access: { has: obj => "year" in obj, get: obj => obj.year, set: (obj, value) => { obj.year = value; } }, metadata: _metadata }, _year_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _month_decorators, { kind: "field", name: "month", static: false, private: false, access: { has: obj => "month" in obj, get: obj => obj.month, set: (obj, value) => { obj.month = value; } }, metadata: _metadata }, _month_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _forAllProperties_decorators, { kind: "field", name: "forAllProperties", static: false, private: false, access: { has: obj => "forAllProperties" in obj, get: obj => obj.forAllProperties, set: (obj, value) => { obj.forAllProperties = value; } }, metadata: _metadata }, _forAllProperties_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _forPropertiesOnStreet_decorators, { kind: "field", name: "forPropertiesOnStreet", static: false, private: false, access: { has: obj => "forPropertiesOnStreet" in obj, get: obj => obj.forPropertiesOnStreet, set: (obj, value) => { obj.forPropertiesOnStreet = value; } }, metadata: _metadata }, _forPropertiesOnStreet_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.GenerateBillingDto = GenerateBillingDto;
let GetBillingQuery = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _streetId_decorators;
    let _streetId_initializers = [];
    let _propertySuscriptionId_decorators;
    let _propertySuscriptionId_initializers = [];
    let _year_decorators;
    let _year_initializers = [];
    let _month_decorators;
    let _month_initializers = [];
    let _forAllProperties_decorators;
    let _forAllProperties_initializers = [];
    let _forPropertiesOnStreet_decorators;
    let _forPropertiesOnStreet_initializers = [];
    return _a = class GetBillingQuery {
            constructor() {
                this.streetId = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _streetId_initializers, void 0));
                this.propertySuscriptionId = __runInitializers(this, _propertySuscriptionId_initializers, void 0);
                this.year = __runInitializers(this, _year_initializers, void 0);
                this.month = __runInitializers(this, _month_initializers, void 0);
                this.forAllProperties = __runInitializers(this, _forAllProperties_initializers, void 0);
                this.forPropertiesOnStreet = __runInitializers(this, _forPropertiesOnStreet_initializers, void 0);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _streetId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _propertySuscriptionId_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            _year_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _month_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _forAllProperties_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _forPropertiesOnStreet_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _streetId_decorators, { kind: "field", name: "streetId", static: false, private: false, access: { has: obj => "streetId" in obj, get: obj => obj.streetId, set: (obj, value) => { obj.streetId = value; } }, metadata: _metadata }, _streetId_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _propertySuscriptionId_decorators, { kind: "field", name: "propertySuscriptionId", static: false, private: false, access: { has: obj => "propertySuscriptionId" in obj, get: obj => obj.propertySuscriptionId, set: (obj, value) => { obj.propertySuscriptionId = value; } }, metadata: _metadata }, _propertySuscriptionId_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _year_decorators, { kind: "field", name: "year", static: false, private: false, access: { has: obj => "year" in obj, get: obj => obj.year, set: (obj, value) => { obj.year = value; } }, metadata: _metadata }, _year_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _month_decorators, { kind: "field", name: "month", static: false, private: false, access: { has: obj => "month" in obj, get: obj => obj.month, set: (obj, value) => { obj.month = value; } }, metadata: _metadata }, _month_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _forAllProperties_decorators, { kind: "field", name: "forAllProperties", static: false, private: false, access: { has: obj => "forAllProperties" in obj, get: obj => obj.forAllProperties, set: (obj, value) => { obj.forAllProperties = value; } }, metadata: _metadata }, _forAllProperties_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _forPropertiesOnStreet_decorators, { kind: "field", name: "forPropertiesOnStreet", static: false, private: false, access: { has: obj => "forPropertiesOnStreet" in obj, get: obj => obj.forPropertiesOnStreet, set: (obj, value) => { obj.forPropertiesOnStreet = value; } }, metadata: _metadata }, _forPropertiesOnStreet_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.GetBillingQuery = GetBillingQuery;
let GetPaymentsQuery = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _month_decorators;
    let _month_initializers = [];
    let _year_decorators;
    let _year_initializers = [];
    let _propertySubscriptionId_decorators;
    let _propertySubscriptionId_initializers = [];
    return _a = class GetPaymentsQuery {
            constructor() {
                this.month = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _month_initializers, void 0));
                this.year = __runInitializers(this, _year_initializers, void 0);
                this.propertySubscriptionId = __runInitializers(this, _propertySubscriptionId_initializers, void 0);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _month_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _year_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _propertySubscriptionId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _month_decorators, { kind: "field", name: "month", static: false, private: false, access: { has: obj => "month" in obj, get: obj => obj.month, set: (obj, value) => { obj.month = value; } }, metadata: _metadata }, _month_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _year_decorators, { kind: "field", name: "year", static: false, private: false, access: { has: obj => "year" in obj, get: obj => obj.year, set: (obj, value) => { obj.year = value; } }, metadata: _metadata }, _year_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _propertySubscriptionId_decorators, { kind: "field", name: "propertySubscriptionId", static: false, private: false, access: { has: obj => "propertySubscriptionId" in obj, get: obj => obj.propertySubscriptionId, set: (obj, value) => { obj.propertySubscriptionId = value; } }, metadata: _metadata }, _propertySubscriptionId_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.GetPaymentsQuery = GetPaymentsQuery;
let GetBillingAccountArrear = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _page_decorators;
    let _page_initializers = [];
    let _limit_decorators;
    let _limit_initializers = [];
    return _a = class GetBillingAccountArrear {
            constructor() {
                this.page = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _page_initializers, void 0));
                this.limit = __runInitializers(this, _limit_initializers, void 0);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _page_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _limit_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            __esDecorate(null, null, _page_decorators, { kind: "field", name: "page", static: false, private: false, access: { has: obj => "page" in obj, get: obj => obj.page, set: (obj, value) => { obj.page = value; } }, metadata: _metadata }, _page_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _limit_decorators, { kind: "field", name: "limit", static: false, private: false, access: { has: obj => "limit" in obj, get: obj => obj.limit, set: (obj, value) => { obj.limit = value; } }, metadata: _metadata }, _limit_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.GetBillingAccountArrear = GetBillingAccountArrear;
let SavePropertyUnitsDetailsDto = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _propertySubscriptionId_decorators;
    let _propertySubscriptionId_initializers = [];
    let _propertySubscriptionUnits_decorators;
    let _propertySubscriptionUnits_initializers = [];
    return _a = class SavePropertyUnitsDetailsDto {
            constructor() {
                this.propertySubscriptionId = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _propertySubscriptionId_initializers, void 0));
                this.propertySubscriptionUnits = __runInitializers(this, _propertySubscriptionUnits_initializers, void 0);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _propertySubscriptionId_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsNumberString)()];
            _propertySubscriptionUnits_decorators = [(0, class_transformer_1.Type)(() => SavePropertyUnitsDto)];
            __esDecorate(null, null, _propertySubscriptionId_decorators, { kind: "field", name: "propertySubscriptionId", static: false, private: false, access: { has: obj => "propertySubscriptionId" in obj, get: obj => obj.propertySubscriptionId, set: (obj, value) => { obj.propertySubscriptionId = value; } }, metadata: _metadata }, _propertySubscriptionId_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _propertySubscriptionUnits_decorators, { kind: "field", name: "propertySubscriptionUnits", static: false, private: false, access: { has: obj => "propertySubscriptionUnits" in obj, get: obj => obj.propertySubscriptionUnits, set: (obj, value) => { obj.propertySubscriptionUnits = value; } }, metadata: _metadata }, _propertySubscriptionUnits_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.SavePropertyUnitsDetailsDto = SavePropertyUnitsDetailsDto;
let SavePropertyUnitsDto = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _propertyTypeId_decorators;
    let _propertyTypeId_initializers = [];
    let _propertyType_decorators;
    let _propertyType_initializers = [];
    let _propertyUnit_decorators;
    let _propertyUnit_initializers = [];
    let _unitPrice_decorators;
    let _unitPrice_initializers = [];
    return _a = class SavePropertyUnitsDto {
            constructor() {
                this.propertyTypeId = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _propertyTypeId_initializers, void 0));
                this.propertyType = __runInitializers(this, _propertyType_initializers, void 0);
                this.propertyUnit = __runInitializers(this, _propertyUnit_initializers, void 0);
                this.unitPrice = __runInitializers(this, _unitPrice_initializers, void 0);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _propertyTypeId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumberString)()];
            _propertyType_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            _propertyUnit_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsNumber)()];
            _unitPrice_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsNumberString)()];
            __esDecorate(null, null, _propertyTypeId_decorators, { kind: "field", name: "propertyTypeId", static: false, private: false, access: { has: obj => "propertyTypeId" in obj, get: obj => obj.propertyTypeId, set: (obj, value) => { obj.propertyTypeId = value; } }, metadata: _metadata }, _propertyTypeId_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _propertyType_decorators, { kind: "field", name: "propertyType", static: false, private: false, access: { has: obj => "propertyType" in obj, get: obj => obj.propertyType, set: (obj, value) => { obj.propertyType = value; } }, metadata: _metadata }, _propertyType_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _propertyUnit_decorators, { kind: "field", name: "propertyUnit", static: false, private: false, access: { has: obj => "propertyUnit" in obj, get: obj => obj.propertyUnit, set: (obj, value) => { obj.propertyUnit = value; } }, metadata: _metadata }, _propertyUnit_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _unitPrice_decorators, { kind: "field", name: "unitPrice", static: false, private: false, access: { has: obj => "unitPrice" in obj, get: obj => obj.unitPrice, set: (obj, value) => { obj.unitPrice = value; } }, metadata: _metadata }, _unitPrice_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.SavePropertyUnitsDto = SavePropertyUnitsDto;
let UpdateArrearDto = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _arrears_decorators;
    let _arrears_initializers = [];
    let _propertySubscriptionId_decorators;
    let _propertySubscriptionId_initializers = [];
    let _reason_decorators;
    let _reason_initializers = [];
    return _a = class UpdateArrearDto {
            constructor() {
                this.arrears = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _arrears_initializers, void 0));
                this.propertySubscriptionId = __runInitializers(this, _propertySubscriptionId_initializers, void 0);
                this.reason = __runInitializers(this, _reason_initializers, void 0);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _arrears_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsNumberString)()];
            _propertySubscriptionId_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsNumberString)()];
            _reason_decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _arrears_decorators, { kind: "field", name: "arrears", static: false, private: false, access: { has: obj => "arrears" in obj, get: obj => obj.arrears, set: (obj, value) => { obj.arrears = value; } }, metadata: _metadata }, _arrears_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _propertySubscriptionId_decorators, { kind: "field", name: "propertySubscriptionId", static: false, private: false, access: { has: obj => "propertySubscriptionId" in obj, get: obj => obj.propertySubscriptionId, set: (obj, value) => { obj.propertySubscriptionId = value; } }, metadata: _metadata }, _propertySubscriptionId_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.UpdateArrearDto = UpdateArrearDto;
