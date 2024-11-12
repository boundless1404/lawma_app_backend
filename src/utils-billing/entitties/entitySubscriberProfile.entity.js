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
exports.EntitySubscriberProfile = void 0;
const typeorm_1 = require("typeorm");
const propertySubscription_entity_1 = require("./propertySubscription.entity");
const phoneCode_entity_1 = require("./phoneCode.entity");
const entitySubscriberProperty_entity_1 = require("./entitySubscriberProperty.entity");
const entityProfile_entity_1 = require("./entityProfile.entity");
const entityUserProfile_entity_1 = require("./entityUserProfile.entity");
let EntitySubscriberProfile = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _id_decorators;
    let _id_initializers = [];
    let _firstName_decorators;
    let _firstName_initializers = [];
    let _lastName_decorators;
    let _lastName_initializers = [];
    let _middleName_decorators;
    let _middleName_initializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _phone_decorators;
    let _phone_initializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _phoneCodeId_decorators;
    let _phoneCodeId_initializers = [];
    let _createdByEntityUserProfileId_decorators;
    let _createdByEntityUserProfileId_initializers = [];
    let _createdByEntityProfileId_decorators;
    let _createdByEntityProfileId_initializers = [];
    let _propertySubscribers_decorators;
    let _propertySubscribers_initializers = [];
    let _phoneCode_decorators;
    let _phoneCode_initializers = [];
    let _entitySubscriberProperties_decorators;
    let _entitySubscriberProperties_initializers = [];
    let _entityProfile_decorators;
    let _entityProfile_initializers = [];
    let _entityUserProfile_decorators;
    let _entityUserProfile_initializers = [];
    var EntitySubscriberProfile = _classThis = class {
        constructor() {
            this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
            this.firstName = __runInitializers(this, _firstName_initializers, void 0);
            this.lastName = __runInitializers(this, _lastName_initializers, void 0);
            this.middleName = __runInitializers(this, _middleName_initializers, void 0);
            this.email = __runInitializers(this, _email_initializers, void 0);
            this.phone = __runInitializers(this, _phone_initializers, void 0);
            this.createdAt = __runInitializers(this, _createdAt_initializers, void 0);
            this.updatedAt = __runInitializers(this, _updatedAt_initializers, void 0);
            // foreign key
            this.phoneCodeId = __runInitializers(this, _phoneCodeId_initializers, void 0);
            this.createdByEntityUserProfileId = __runInitializers(this, _createdByEntityUserProfileId_initializers, void 0);
            this.createdByEntityProfileId = __runInitializers(this, _createdByEntityProfileId_initializers, void 0);
            // relations
            this.propertySubscribers = __runInitializers(this, _propertySubscribers_initializers, void 0);
            this.phoneCode = __runInitializers(this, _phoneCode_initializers, void 0);
            this.entitySubscriberProperties = __runInitializers(this, _entitySubscriberProperties_initializers, void 0);
            this.entityProfile = __runInitializers(this, _entityProfile_initializers, void 0);
            this.entityUserProfile = __runInitializers(this, _entityUserProfile_initializers, void 0);
        }
    };
    __setFunctionName(_classThis, "EntitySubscriberProfile");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' })];
        _firstName_decorators = [(0, typeorm_1.Column)({ type: 'varchar' })];
        _lastName_decorators = [(0, typeorm_1.Column)({ type: 'varchar' })];
        _middleName_decorators = [(0, typeorm_1.Column)({ type: 'varchar', nullable: true })];
        _email_decorators = [(0, typeorm_1.Column)({ type: 'varchar', unique: true, nullable: true })];
        _phone_decorators = [(0, typeorm_1.Column)({ type: 'varchar', unique: true, nullable: true })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' })];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' })];
        _phoneCodeId_decorators = [(0, typeorm_1.Column)({ type: 'bigint', nullable: true })];
        _createdByEntityUserProfileId_decorators = [(0, typeorm_1.Column)({ type: 'bigint', nullable: true })];
        _createdByEntityProfileId_decorators = [(0, typeorm_1.Column)({ type: 'bigint', nullable: true })];
        _propertySubscribers_decorators = [(0, typeorm_1.OneToMany)(() => propertySubscription_entity_1.PropertySubscription, (propertySubscriber) => propertySubscriber.entitySubscriberProfile)];
        _phoneCode_decorators = [(0, typeorm_1.ManyToOne)(() => phoneCode_entity_1.PhoneCode, (phoneCode) => phoneCode.entitySubscriberProfiles), (0, typeorm_1.JoinColumn)({ name: 'phoneCodeId' })];
        _entitySubscriberProperties_decorators = [(0, typeorm_1.OneToMany)(() => entitySubscriberProperty_entity_1.EntitySubscriberProperty, (entitySubscriberProperty) => entitySubscriberProperty.entitySubscriberProfile)];
        _entityProfile_decorators = [(0, typeorm_1.ManyToOne)(() => entityProfile_entity_1.EntityProfile, (entityProfile) => entityProfile.entitySubscriberProfiles), (0, typeorm_1.JoinColumn)({ name: 'createdByEntityProfileId' })];
        _entityUserProfile_decorators = [(0, typeorm_1.ManyToOne)(() => entityUserProfile_entity_1.EntityUserProfile, (entityUserProfile) => entityUserProfile.createdEntitySubscriberProfiles), (0, typeorm_1.JoinColumn)({ name: 'createdByEntityUserProfileId' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _firstName_decorators, { kind: "field", name: "firstName", static: false, private: false, access: { has: obj => "firstName" in obj, get: obj => obj.firstName, set: (obj, value) => { obj.firstName = value; } }, metadata: _metadata }, _firstName_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _lastName_decorators, { kind: "field", name: "lastName", static: false, private: false, access: { has: obj => "lastName" in obj, get: obj => obj.lastName, set: (obj, value) => { obj.lastName = value; } }, metadata: _metadata }, _lastName_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _middleName_decorators, { kind: "field", name: "middleName", static: false, private: false, access: { has: obj => "middleName" in obj, get: obj => obj.middleName, set: (obj, value) => { obj.middleName = value; } }, metadata: _metadata }, _middleName_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: obj => "phone" in obj, get: obj => obj.phone, set: (obj, value) => { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _phoneCodeId_decorators, { kind: "field", name: "phoneCodeId", static: false, private: false, access: { has: obj => "phoneCodeId" in obj, get: obj => obj.phoneCodeId, set: (obj, value) => { obj.phoneCodeId = value; } }, metadata: _metadata }, _phoneCodeId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _createdByEntityUserProfileId_decorators, { kind: "field", name: "createdByEntityUserProfileId", static: false, private: false, access: { has: obj => "createdByEntityUserProfileId" in obj, get: obj => obj.createdByEntityUserProfileId, set: (obj, value) => { obj.createdByEntityUserProfileId = value; } }, metadata: _metadata }, _createdByEntityUserProfileId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _createdByEntityProfileId_decorators, { kind: "field", name: "createdByEntityProfileId", static: false, private: false, access: { has: obj => "createdByEntityProfileId" in obj, get: obj => obj.createdByEntityProfileId, set: (obj, value) => { obj.createdByEntityProfileId = value; } }, metadata: _metadata }, _createdByEntityProfileId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _propertySubscribers_decorators, { kind: "field", name: "propertySubscribers", static: false, private: false, access: { has: obj => "propertySubscribers" in obj, get: obj => obj.propertySubscribers, set: (obj, value) => { obj.propertySubscribers = value; } }, metadata: _metadata }, _propertySubscribers_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _phoneCode_decorators, { kind: "field", name: "phoneCode", static: false, private: false, access: { has: obj => "phoneCode" in obj, get: obj => obj.phoneCode, set: (obj, value) => { obj.phoneCode = value; } }, metadata: _metadata }, _phoneCode_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _entitySubscriberProperties_decorators, { kind: "field", name: "entitySubscriberProperties", static: false, private: false, access: { has: obj => "entitySubscriberProperties" in obj, get: obj => obj.entitySubscriberProperties, set: (obj, value) => { obj.entitySubscriberProperties = value; } }, metadata: _metadata }, _entitySubscriberProperties_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _entityProfile_decorators, { kind: "field", name: "entityProfile", static: false, private: false, access: { has: obj => "entityProfile" in obj, get: obj => obj.entityProfile, set: (obj, value) => { obj.entityProfile = value; } }, metadata: _metadata }, _entityProfile_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _entityUserProfile_decorators, { kind: "field", name: "entityUserProfile", static: false, private: false, access: { has: obj => "entityUserProfile" in obj, get: obj => obj.entityUserProfile, set: (obj, value) => { obj.entityUserProfile = value; } }, metadata: _metadata }, _entityUserProfile_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EntitySubscriberProfile = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EntitySubscriberProfile = _classThis;
})();
exports.EntitySubscriberProfile = EntitySubscriberProfile;
