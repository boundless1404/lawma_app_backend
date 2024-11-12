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
exports.PhoneCode = void 0;
const typeorm_1 = require("typeorm");
const country_entity_1 = require("./country.entity");
const entityUserProfile_entity_1 = require("./entityUserProfile.entity");
const entitySubscriberProfile_entity_1 = require("./entitySubscriberProfile.entity");
let PhoneCode = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _id_decorators;
    let _id_initializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _countryId_decorators;
    let _countryId_initializers = [];
    let _country_decorators;
    let _country_initializers = [];
    let _entityUserProfiles_decorators;
    let _entityUserProfiles_initializers = [];
    let _entitySubscriberProfiles_decorators;
    let _entitySubscriberProfiles_initializers = [];
    var PhoneCode = _classThis = class {
        constructor() {
            this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
            this.name = __runInitializers(this, _name_initializers, void 0);
            this.updatedAt = __runInitializers(this, _updatedAt_initializers, void 0);
            this.createdAt = __runInitializers(this, _createdAt_initializers, void 0);
            // foreign keys
            this.countryId = __runInitializers(this, _countryId_initializers, void 0);
            // relations
            this.country = __runInitializers(this, _country_initializers, void 0);
            this.entityUserProfiles = __runInitializers(this, _entityUserProfiles_initializers, void 0);
            this.entitySubscriberProfiles = __runInitializers(this, _entitySubscriberProfiles_initializers, void 0);
        }
    };
    __setFunctionName(_classThis, "PhoneCode");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' })];
        _name_decorators = [(0, typeorm_1.Column)({ type: 'varchar' })];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' })];
        _countryId_decorators = [(0, typeorm_1.Column)({ type: 'bigint' })];
        _country_decorators = [(0, typeorm_1.ManyToOne)(() => country_entity_1.Country, (country) => country.phoneCodes), (0, typeorm_1.JoinColumn)({ name: 'countryId' })];
        _entityUserProfiles_decorators = [(0, typeorm_1.OneToMany)(() => entityUserProfile_entity_1.EntityUserProfile, (entityUserProfile) => entityUserProfile.phoneCode)];
        _entitySubscriberProfiles_decorators = [(0, typeorm_1.OneToMany)(() => entitySubscriberProfile_entity_1.EntitySubscriberProfile, (entitySubscriberProfile) => entitySubscriberProfile.phoneCode)];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _countryId_decorators, { kind: "field", name: "countryId", static: false, private: false, access: { has: obj => "countryId" in obj, get: obj => obj.countryId, set: (obj, value) => { obj.countryId = value; } }, metadata: _metadata }, _countryId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _country_decorators, { kind: "field", name: "country", static: false, private: false, access: { has: obj => "country" in obj, get: obj => obj.country, set: (obj, value) => { obj.country = value; } }, metadata: _metadata }, _country_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _entityUserProfiles_decorators, { kind: "field", name: "entityUserProfiles", static: false, private: false, access: { has: obj => "entityUserProfiles" in obj, get: obj => obj.entityUserProfiles, set: (obj, value) => { obj.entityUserProfiles = value; } }, metadata: _metadata }, _entityUserProfiles_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _entitySubscriberProfiles_decorators, { kind: "field", name: "entitySubscriberProfiles", static: false, private: false, access: { has: obj => "entitySubscriberProfiles" in obj, get: obj => obj.entitySubscriberProfiles, set: (obj, value) => { obj.entitySubscriberProfiles = value; } }, metadata: _metadata }, _entitySubscriberProfiles_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PhoneCode = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PhoneCode = _classThis;
})();
exports.PhoneCode = PhoneCode;
