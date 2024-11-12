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
exports.PropertySubscriptionUnit = void 0;
const typeorm_1 = require("typeorm");
const entitySubscriberProperty_entity_1 = require("./entitySubscriberProperty.entity");
const propertySubscription_entity_1 = require("./propertySubscription.entity");
let PropertySubscriptionUnit = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _propertySubscriptionId_decorators;
    let _propertySubscriptionId_initializers = [];
    let _entiySubscriberPropertyId_decorators;
    let _entiySubscriberPropertyId_initializers = [];
    let _propertyUnits_decorators;
    let _propertyUnits_initializers = [];
    let _propertySubscription_decorators;
    let _propertySubscription_initializers = [];
    let _entitySubscriberProperty_decorators;
    let _entitySubscriberProperty_initializers = [];
    var PropertySubscriptionUnit = _classThis = class {
        constructor() {
            this.propertySubscriptionId = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _propertySubscriptionId_initializers, void 0));
            this.entiySubscriberPropertyId = __runInitializers(this, _entiySubscriberPropertyId_initializers, void 0);
            this.propertyUnits = __runInitializers(this, _propertyUnits_initializers, void 0);
            // relations
            this.propertySubscription = __runInitializers(this, _propertySubscription_initializers, void 0);
            this.entitySubscriberProperty = __runInitializers(this, _entitySubscriberProperty_initializers, void 0);
        }
    };
    __setFunctionName(_classThis, "PropertySubscriptionUnit");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _propertySubscriptionId_decorators = [(0, typeorm_1.PrimaryColumn)({ type: 'bigint' })];
        _entiySubscriberPropertyId_decorators = [(0, typeorm_1.PrimaryColumn)({ type: 'bigint' })];
        _propertyUnits_decorators = [(0, typeorm_1.Column)({ type: 'integer' })];
        _propertySubscription_decorators = [(0, typeorm_1.ManyToOne)(() => propertySubscription_entity_1.PropertySubscription, (propertySubscription) => propertySubscription.propertySubscriptionUnits), (0, typeorm_1.JoinColumn)({ name: 'propertySubscriptionId' })];
        _entitySubscriberProperty_decorators = [(0, typeorm_1.ManyToOne)(() => entitySubscriberProperty_entity_1.EntitySubscriberProperty, (entitySubscriberProperty) => entitySubscriberProperty.propertySubscriptionUnits), (0, typeorm_1.JoinColumn)({ name: 'entiySubscriberPropertyId' })];
        __esDecorate(null, null, _propertySubscriptionId_decorators, { kind: "field", name: "propertySubscriptionId", static: false, private: false, access: { has: obj => "propertySubscriptionId" in obj, get: obj => obj.propertySubscriptionId, set: (obj, value) => { obj.propertySubscriptionId = value; } }, metadata: _metadata }, _propertySubscriptionId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _entiySubscriberPropertyId_decorators, { kind: "field", name: "entiySubscriberPropertyId", static: false, private: false, access: { has: obj => "entiySubscriberPropertyId" in obj, get: obj => obj.entiySubscriberPropertyId, set: (obj, value) => { obj.entiySubscriberPropertyId = value; } }, metadata: _metadata }, _entiySubscriberPropertyId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _propertyUnits_decorators, { kind: "field", name: "propertyUnits", static: false, private: false, access: { has: obj => "propertyUnits" in obj, get: obj => obj.propertyUnits, set: (obj, value) => { obj.propertyUnits = value; } }, metadata: _metadata }, _propertyUnits_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _propertySubscription_decorators, { kind: "field", name: "propertySubscription", static: false, private: false, access: { has: obj => "propertySubscription" in obj, get: obj => obj.propertySubscription, set: (obj, value) => { obj.propertySubscription = value; } }, metadata: _metadata }, _propertySubscription_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _entitySubscriberProperty_decorators, { kind: "field", name: "entitySubscriberProperty", static: false, private: false, access: { has: obj => "entitySubscriberProperty" in obj, get: obj => obj.entitySubscriberProperty, set: (obj, value) => { obj.entitySubscriberProperty = value; } }, metadata: _metadata }, _entitySubscriberProperty_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PropertySubscriptionUnit = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PropertySubscriptionUnit = _classThis;
})();
exports.PropertySubscriptionUnit = PropertySubscriptionUnit;
