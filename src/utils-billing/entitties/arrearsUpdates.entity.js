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
const typeorm_1 = require("typeorm");
const propertySubscription_entity_1 = require("./propertySubscription.entity");
const entityUserProfile_entity_1 = require("./entityUserProfile.entity");
let ArrearsUpdate = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _id_decorators;
    let _id_initializers = [];
    let _amountBeforeUpdate_decorators;
    let _amountBeforeUpdate_initializers = [];
    let _amountAfterUpdate_decorators;
    let _amountAfterUpdate_initializers = [];
    let _reasonToUpdate_decorators;
    let _reasonToUpdate_initializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _propertySubscriptionId_decorators;
    let _propertySubscriptionId_initializers = [];
    let _updatedByUserId_decorators;
    let _updatedByUserId_initializers = [];
    let _propertySubscription_decorators;
    let _propertySubscription_initializers = [];
    let _entityUser_decorators;
    let _entityUser_initializers = [];
    var ArrearsUpdate = _classThis = class {
        constructor() {
            this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
            this.amountBeforeUpdate = __runInitializers(this, _amountBeforeUpdate_initializers, void 0);
            this.amountAfterUpdate = __runInitializers(this, _amountAfterUpdate_initializers, void 0);
            this.reasonToUpdate = __runInitializers(this, _reasonToUpdate_initializers, void 0);
            this.createdAt = __runInitializers(this, _createdAt_initializers, void 0);
            // foreign keys
            this.propertySubscriptionId = __runInitializers(this, _propertySubscriptionId_initializers, void 0);
            this.updatedByUserId = __runInitializers(this, _updatedByUserId_initializers, void 0);
            // relations
            this.propertySubscription = __runInitializers(this, _propertySubscription_initializers, void 0);
            this.entityUser = __runInitializers(this, _entityUser_initializers, void 0);
        }
    };
    __setFunctionName(_classThis, "ArrearsUpdate");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' })];
        _amountBeforeUpdate_decorators = [(0, typeorm_1.Column)({ type: 'numeric', nullable: false })];
        _amountAfterUpdate_decorators = [(0, typeorm_1.Column)({ type: 'numeric', nullable: false })];
        _reasonToUpdate_decorators = [(0, typeorm_1.Column)({ type: 'varchar', nullable: false })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' })];
        _propertySubscriptionId_decorators = [(0, typeorm_1.Column)({ type: 'bigint', nullable: false })];
        _updatedByUserId_decorators = [(0, typeorm_1.Column)({ type: 'bigint', nullable: true })];
        _propertySubscription_decorators = [(0, typeorm_1.ManyToOne)(() => propertySubscription_entity_1.PropertySubscription, (propertySubscription) => propertySubscription.arrearsUpdates, { onDelete: 'CASCADE' }), (0, typeorm_1.JoinColumn)({ name: 'propertySubscriptionId' })];
        _entityUser_decorators = [(0, typeorm_1.ManyToOne)(() => entityUserProfile_entity_1.EntityUserProfile, (entityUser) => entityUser.arrearsUpdates), (0, typeorm_1.JoinColumn)({ name: 'updatedByUserId' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _amountBeforeUpdate_decorators, { kind: "field", name: "amountBeforeUpdate", static: false, private: false, access: { has: obj => "amountBeforeUpdate" in obj, get: obj => obj.amountBeforeUpdate, set: (obj, value) => { obj.amountBeforeUpdate = value; } }, metadata: _metadata }, _amountBeforeUpdate_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _amountAfterUpdate_decorators, { kind: "field", name: "amountAfterUpdate", static: false, private: false, access: { has: obj => "amountAfterUpdate" in obj, get: obj => obj.amountAfterUpdate, set: (obj, value) => { obj.amountAfterUpdate = value; } }, metadata: _metadata }, _amountAfterUpdate_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _reasonToUpdate_decorators, { kind: "field", name: "reasonToUpdate", static: false, private: false, access: { has: obj => "reasonToUpdate" in obj, get: obj => obj.reasonToUpdate, set: (obj, value) => { obj.reasonToUpdate = value; } }, metadata: _metadata }, _reasonToUpdate_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _propertySubscriptionId_decorators, { kind: "field", name: "propertySubscriptionId", static: false, private: false, access: { has: obj => "propertySubscriptionId" in obj, get: obj => obj.propertySubscriptionId, set: (obj, value) => { obj.propertySubscriptionId = value; } }, metadata: _metadata }, _propertySubscriptionId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _updatedByUserId_decorators, { kind: "field", name: "updatedByUserId", static: false, private: false, access: { has: obj => "updatedByUserId" in obj, get: obj => obj.updatedByUserId, set: (obj, value) => { obj.updatedByUserId = value; } }, metadata: _metadata }, _updatedByUserId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _propertySubscription_decorators, { kind: "field", name: "propertySubscription", static: false, private: false, access: { has: obj => "propertySubscription" in obj, get: obj => obj.propertySubscription, set: (obj, value) => { obj.propertySubscription = value; } }, metadata: _metadata }, _propertySubscription_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _entityUser_decorators, { kind: "field", name: "entityUser", static: false, private: false, access: { has: obj => "entityUser" in obj, get: obj => obj.entityUser, set: (obj, value) => { obj.entityUser = value; } }, metadata: _metadata }, _entityUser_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ArrearsUpdate = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ArrearsUpdate = _classThis;
})();
exports.default = ArrearsUpdate;
