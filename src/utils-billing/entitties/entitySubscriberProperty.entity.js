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
exports.EntitySubscriberProperty = void 0;
const typeorm_1 = require("typeorm");
const propertyTypes_entity_1 = require("./propertyTypes.entity");
const PropertySubscriptionUnit_entity_1 = require("./PropertySubscriptionUnit.entity");
const entitySubscriberProfile_entity_1 = require("./entitySubscriberProfile.entity");
let EntitySubscriberProperty = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _id_decorators;
    let _id_initializers = [];
    let _ownerEntitySubscriberProfileId_decorators;
    let _ownerEntitySubscriberProfileId_initializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _deletedAt_decorators;
    let _deletedAt_initializers = [];
    let _propertyTypeId_decorators;
    let _propertyTypeId_initializers = [];
    let _propertyType_decorators;
    let _propertyType_initializers = [];
    let _propertySubscriptionUnits_decorators;
    let _propertySubscriptionUnits_initializers = [];
    let _entitySubscriberProfile_decorators;
    let _entitySubscriberProfile_initializers = [];
    var EntitySubscriberProperty = _classThis = class {
        constructor() {
            this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
            // @Column({ type: 'bigint' })
            // oldCode: string;
            this.ownerEntitySubscriberProfileId = __runInitializers(this, _ownerEntitySubscriberProfileId_initializers, void 0);
            this.createdAt = __runInitializers(this, _createdAt_initializers, void 0);
            this.updatedAt = __runInitializers(this, _updatedAt_initializers, void 0);
            this.deletedAt = __runInitializers(this, _deletedAt_initializers, void 0);
            // foreign keys
            this.propertyTypeId = __runInitializers(this, _propertyTypeId_initializers, void 0);
            // relations
            this.propertyType = __runInitializers(this, _propertyType_initializers, void 0);
            this.propertySubscriptionUnits = __runInitializers(this, _propertySubscriptionUnits_initializers, void 0);
            // @OneToMany(() => Payment, (payment) => payment.propertySubscription)
            // payments: Payment[];
            this.entitySubscriberProfile = __runInitializers(this, _entitySubscriberProfile_initializers, void 0);
        }
    };
    __setFunctionName(_classThis, "EntitySubscriberProperty");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' })];
        _ownerEntitySubscriberProfileId_decorators = [(0, typeorm_1.Column)({ type: 'bigint', nullable: true })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' })];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' })];
        _deletedAt_decorators = [(0, typeorm_1.DeleteDateColumn)({ type: 'timestamptz' })];
        _propertyTypeId_decorators = [(0, typeorm_1.Column)({ type: 'bigint' })];
        _propertyType_decorators = [(0, typeorm_1.ManyToOne)(() => propertyTypes_entity_1.PropertyType, (propertyType) => propertyType.subscriberProperties), (0, typeorm_1.JoinColumn)({ name: 'propertyTypeId' })];
        _propertySubscriptionUnits_decorators = [(0, typeorm_1.OneToMany)(() => PropertySubscriptionUnit_entity_1.PropertySubscriptionUnit, (propertySubscriptionUnit) => propertySubscriptionUnit.entitySubscriberProperty)];
        _entitySubscriberProfile_decorators = [(0, typeorm_1.ManyToOne)(() => entitySubscriberProfile_entity_1.EntitySubscriberProfile, (entitySubscriber) => entitySubscriber.entitySubscriberProperties), (0, typeorm_1.JoinColumn)({ name: 'ownerEntitySubscriberProfileId' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _ownerEntitySubscriberProfileId_decorators, { kind: "field", name: "ownerEntitySubscriberProfileId", static: false, private: false, access: { has: obj => "ownerEntitySubscriberProfileId" in obj, get: obj => obj.ownerEntitySubscriberProfileId, set: (obj, value) => { obj.ownerEntitySubscriberProfileId = value; } }, metadata: _metadata }, _ownerEntitySubscriberProfileId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _deletedAt_decorators, { kind: "field", name: "deletedAt", static: false, private: false, access: { has: obj => "deletedAt" in obj, get: obj => obj.deletedAt, set: (obj, value) => { obj.deletedAt = value; } }, metadata: _metadata }, _deletedAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _propertyTypeId_decorators, { kind: "field", name: "propertyTypeId", static: false, private: false, access: { has: obj => "propertyTypeId" in obj, get: obj => obj.propertyTypeId, set: (obj, value) => { obj.propertyTypeId = value; } }, metadata: _metadata }, _propertyTypeId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _propertyType_decorators, { kind: "field", name: "propertyType", static: false, private: false, access: { has: obj => "propertyType" in obj, get: obj => obj.propertyType, set: (obj, value) => { obj.propertyType = value; } }, metadata: _metadata }, _propertyType_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _propertySubscriptionUnits_decorators, { kind: "field", name: "propertySubscriptionUnits", static: false, private: false, access: { has: obj => "propertySubscriptionUnits" in obj, get: obj => obj.propertySubscriptionUnits, set: (obj, value) => { obj.propertySubscriptionUnits = value; } }, metadata: _metadata }, _propertySubscriptionUnits_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _entitySubscriberProfile_decorators, { kind: "field", name: "entitySubscriberProfile", static: false, private: false, access: { has: obj => "entitySubscriberProfile" in obj, get: obj => obj.entitySubscriberProfile, set: (obj, value) => { obj.entitySubscriberProfile = value; } }, metadata: _metadata }, _entitySubscriberProfile_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EntitySubscriberProperty = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EntitySubscriberProperty = _classThis;
})();
exports.EntitySubscriberProperty = EntitySubscriberProperty;
