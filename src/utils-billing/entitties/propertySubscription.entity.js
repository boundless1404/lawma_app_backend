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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertySubscription = void 0;
const enums_1 = require("../../lib/enums");
const typeorm_1 = require("typeorm");
const entitySubscriberProfile_entity_1 = require("./entitySubscriberProfile.entity");
const street_entity_1 = require("./street.entity");
const PropertySubscriptionUnit_entity_1 = require("./PropertySubscriptionUnit.entity");
const billingAccount_entity_1 = require("./billingAccount.entity");
const billing_entity_1 = require("./billing.entity");
const payments_entity_1 = require("./payments.entity");
const entityProfile_entity_1 = require("./entityProfile.entity");
const arrearsUpdates_entity_1 = __importDefault(require("./arrearsUpdates.entity"));
let PropertySubscription = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _id_decorators;
    let _id_initializers = [];
    let _propertySubscriptionName_decorators;
    let _propertySubscriptionName_initializers = [];
    let _subscriberProfileRole_decorators;
    let _subscriberProfileRole_initializers = [];
    let _oldCode_decorators;
    let _oldCode_initializers = [];
    let _streetNumber_decorators;
    let _streetNumber_initializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _deletedAt_decorators;
    let _deletedAt_initializers = [];
    let _streetId_decorators;
    let _streetId_initializers = [];
    let _entitySubscriberProfileId_decorators;
    let _entitySubscriberProfileId_initializers = [];
    let _entityProfileId_decorators;
    let _entityProfileId_initializers = [];
    let _street_decorators;
    let _street_initializers = [];
    let _entitySubscriberProfile_decorators;
    let _entitySubscriberProfile_initializers = [];
    let _propertySubscriptionUnits_decorators;
    let _propertySubscriptionUnits_initializers = [];
    let _billings_decorators;
    let _billings_initializers = [];
    let _billingAccount_decorators;
    let _billingAccount_initializers = [];
    let _payments_decorators;
    let _payments_initializers = [];
    let _entityProfile_decorators;
    let _entityProfile_initializers = [];
    let _arrearsUpdates_decorators;
    let _arrearsUpdates_initializers = [];
    var PropertySubscription = _classThis = class {
        constructor() {
            this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
            this.propertySubscriptionName = __runInitializers(this, _propertySubscriptionName_initializers, void 0);
            this.subscriberProfileRole = __runInitializers(this, _subscriberProfileRole_initializers, void 0);
            this.oldCode = __runInitializers(this, _oldCode_initializers, void 0);
            this.streetNumber = __runInitializers(this, _streetNumber_initializers, void 0);
            this.createdAt = __runInitializers(this, _createdAt_initializers, void 0);
            this.updatedAt = __runInitializers(this, _updatedAt_initializers, void 0);
            this.deletedAt = __runInitializers(this, _deletedAt_initializers, void 0);
            // foreign keys
            this.streetId = __runInitializers(this, _streetId_initializers, void 0);
            this.entitySubscriberProfileId = __runInitializers(this, _entitySubscriberProfileId_initializers, void 0);
            this.entityProfileId = __runInitializers(this, _entityProfileId_initializers, void 0);
            // relations
            this.street = __runInitializers(this, _street_initializers, void 0);
            this.entitySubscriberProfile = __runInitializers(this, _entitySubscriberProfile_initializers, void 0);
            this.propertySubscriptionUnits = __runInitializers(this, _propertySubscriptionUnits_initializers, void 0);
            this.billings = __runInitializers(this, _billings_initializers, void 0);
            this.billingAccount = __runInitializers(this, _billingAccount_initializers, void 0);
            this.payments = __runInitializers(this, _payments_initializers, void 0);
            this.entityProfile = __runInitializers(this, _entityProfile_initializers, void 0);
            this.arrearsUpdates = __runInitializers(this, _arrearsUpdates_initializers, void 0);
        }
    };
    __setFunctionName(_classThis, "PropertySubscription");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' })];
        _propertySubscriptionName_decorators = [(0, typeorm_1.Column)({ type: 'varchar' })];
        _subscriberProfileRole_decorators = [(0, typeorm_1.Column)({ type: 'enum', enum: enums_1.SubscriberProfileRoleEnum })];
        _oldCode_decorators = [(0, typeorm_1.Column)({ type: 'varchar', nullable: true })];
        _streetNumber_decorators = [(0, typeorm_1.Column)({ type: 'varchar' })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' })];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' })];
        _deletedAt_decorators = [(0, typeorm_1.DeleteDateColumn)({ type: 'timestamptz' })];
        _streetId_decorators = [(0, typeorm_1.Column)({ type: 'bigint' })];
        _entitySubscriberProfileId_decorators = [(0, typeorm_1.Column)({ type: 'bigint' })];
        _entityProfileId_decorators = [(0, typeorm_1.Column)({ type: 'bigint' })];
        _street_decorators = [(0, typeorm_1.ManyToOne)(() => street_entity_1.Street, (street) => street.propertySubscriptions), (0, typeorm_1.JoinColumn)({ name: 'streetId' })];
        _entitySubscriberProfile_decorators = [(0, typeorm_1.ManyToOne)(() => entitySubscriberProfile_entity_1.EntitySubscriberProfile, (entitySubscriberProfile) => entitySubscriberProfile.propertySubscribers), (0, typeorm_1.JoinColumn)({ name: 'entitySubscriberProfileId' })];
        _propertySubscriptionUnits_decorators = [(0, typeorm_1.OneToMany)(() => PropertySubscriptionUnit_entity_1.PropertySubscriptionUnit, (unit) => unit.propertySubscription)];
        _billings_decorators = [(0, typeorm_1.OneToMany)(() => billing_entity_1.Billing, (billing) => billing.propertySubscription)];
        _billingAccount_decorators = [(0, typeorm_1.OneToOne)(() => billingAccount_entity_1.BillingAccount, (billingAccount) => billingAccount.propertySubscription)];
        _payments_decorators = [(0, typeorm_1.OneToMany)(() => payments_entity_1.Payment, (payment) => payment.propertySubscription)];
        _entityProfile_decorators = [(0, typeorm_1.ManyToOne)(() => entityProfile_entity_1.EntityProfile, (entityProfile) => entityProfile.propertySubscriptions), (0, typeorm_1.JoinColumn)({ name: 'entityProfileId' })];
        _arrearsUpdates_decorators = [(0, typeorm_1.OneToMany)(() => arrearsUpdates_entity_1.default, (arrearsUpdate) => arrearsUpdate.propertySubscription)];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _propertySubscriptionName_decorators, { kind: "field", name: "propertySubscriptionName", static: false, private: false, access: { has: obj => "propertySubscriptionName" in obj, get: obj => obj.propertySubscriptionName, set: (obj, value) => { obj.propertySubscriptionName = value; } }, metadata: _metadata }, _propertySubscriptionName_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _subscriberProfileRole_decorators, { kind: "field", name: "subscriberProfileRole", static: false, private: false, access: { has: obj => "subscriberProfileRole" in obj, get: obj => obj.subscriberProfileRole, set: (obj, value) => { obj.subscriberProfileRole = value; } }, metadata: _metadata }, _subscriberProfileRole_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _oldCode_decorators, { kind: "field", name: "oldCode", static: false, private: false, access: { has: obj => "oldCode" in obj, get: obj => obj.oldCode, set: (obj, value) => { obj.oldCode = value; } }, metadata: _metadata }, _oldCode_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _streetNumber_decorators, { kind: "field", name: "streetNumber", static: false, private: false, access: { has: obj => "streetNumber" in obj, get: obj => obj.streetNumber, set: (obj, value) => { obj.streetNumber = value; } }, metadata: _metadata }, _streetNumber_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _deletedAt_decorators, { kind: "field", name: "deletedAt", static: false, private: false, access: { has: obj => "deletedAt" in obj, get: obj => obj.deletedAt, set: (obj, value) => { obj.deletedAt = value; } }, metadata: _metadata }, _deletedAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _streetId_decorators, { kind: "field", name: "streetId", static: false, private: false, access: { has: obj => "streetId" in obj, get: obj => obj.streetId, set: (obj, value) => { obj.streetId = value; } }, metadata: _metadata }, _streetId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _entitySubscriberProfileId_decorators, { kind: "field", name: "entitySubscriberProfileId", static: false, private: false, access: { has: obj => "entitySubscriberProfileId" in obj, get: obj => obj.entitySubscriberProfileId, set: (obj, value) => { obj.entitySubscriberProfileId = value; } }, metadata: _metadata }, _entitySubscriberProfileId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _entityProfileId_decorators, { kind: "field", name: "entityProfileId", static: false, private: false, access: { has: obj => "entityProfileId" in obj, get: obj => obj.entityProfileId, set: (obj, value) => { obj.entityProfileId = value; } }, metadata: _metadata }, _entityProfileId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _street_decorators, { kind: "field", name: "street", static: false, private: false, access: { has: obj => "street" in obj, get: obj => obj.street, set: (obj, value) => { obj.street = value; } }, metadata: _metadata }, _street_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _entitySubscriberProfile_decorators, { kind: "field", name: "entitySubscriberProfile", static: false, private: false, access: { has: obj => "entitySubscriberProfile" in obj, get: obj => obj.entitySubscriberProfile, set: (obj, value) => { obj.entitySubscriberProfile = value; } }, metadata: _metadata }, _entitySubscriberProfile_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _propertySubscriptionUnits_decorators, { kind: "field", name: "propertySubscriptionUnits", static: false, private: false, access: { has: obj => "propertySubscriptionUnits" in obj, get: obj => obj.propertySubscriptionUnits, set: (obj, value) => { obj.propertySubscriptionUnits = value; } }, metadata: _metadata }, _propertySubscriptionUnits_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _billings_decorators, { kind: "field", name: "billings", static: false, private: false, access: { has: obj => "billings" in obj, get: obj => obj.billings, set: (obj, value) => { obj.billings = value; } }, metadata: _metadata }, _billings_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _billingAccount_decorators, { kind: "field", name: "billingAccount", static: false, private: false, access: { has: obj => "billingAccount" in obj, get: obj => obj.billingAccount, set: (obj, value) => { obj.billingAccount = value; } }, metadata: _metadata }, _billingAccount_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _payments_decorators, { kind: "field", name: "payments", static: false, private: false, access: { has: obj => "payments" in obj, get: obj => obj.payments, set: (obj, value) => { obj.payments = value; } }, metadata: _metadata }, _payments_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _entityProfile_decorators, { kind: "field", name: "entityProfile", static: false, private: false, access: { has: obj => "entityProfile" in obj, get: obj => obj.entityProfile, set: (obj, value) => { obj.entityProfile = value; } }, metadata: _metadata }, _entityProfile_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _arrearsUpdates_decorators, { kind: "field", name: "arrearsUpdates", static: false, private: false, access: { has: obj => "arrearsUpdates" in obj, get: obj => obj.arrearsUpdates, set: (obj, value) => { obj.arrearsUpdates = value; } }, metadata: _metadata }, _arrearsUpdates_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PropertySubscription = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PropertySubscription = _classThis;
})();
exports.PropertySubscription = PropertySubscription;
