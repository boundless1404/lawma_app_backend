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
exports.Billing = void 0;
const typeorm_1 = require("typeorm");
const propertySubscription_entity_1 = require("./propertySubscription.entity");
let Billing = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _id_decorators;
    let _id_initializers = [];
    let _amount_decorators;
    let _amount_initializers = [];
    let _month_decorators;
    let _month_initializers = [];
    let _year_decorators;
    let _year_initializers = [];
    let _propertySubscriptionId_decorators;
    let _propertySubscriptionId_initializers = [];
    let _propertySubscription_decorators;
    let _propertySubscription_initializers = [];
    var Billing = _classThis = class {
        constructor() {
            this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
            this.amount = __runInitializers(this, _amount_initializers, void 0);
            this.month = __runInitializers(this, _month_initializers, void 0);
            this.year = __runInitializers(this, _year_initializers, void 0);
            // foreign keys
            this.propertySubscriptionId = __runInitializers(this, _propertySubscriptionId_initializers, void 0);
            // @Column({ type: 'bigint' })
            // entitySubscriptionId: string;
            // relationss
            this.propertySubscription = __runInitializers(this, _propertySubscription_initializers, void 0);
        }
    };
    __setFunctionName(_classThis, "Billing");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' })];
        _amount_decorators = [(0, typeorm_1.Column)({ type: 'numeric' })];
        _month_decorators = [(0, typeorm_1.Column)({ type: 'varchar' })];
        _year_decorators = [(0, typeorm_1.Column)({ type: 'varchar' })];
        _propertySubscriptionId_decorators = [(0, typeorm_1.Column)({ type: 'bigint' })];
        _propertySubscription_decorators = [(0, typeorm_1.ManyToOne)(() => propertySubscription_entity_1.PropertySubscription, (propertySubscription) => propertySubscription.billings), (0, typeorm_1.JoinColumn)({ name: 'propertySubscriptionId' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _month_decorators, { kind: "field", name: "month", static: false, private: false, access: { has: obj => "month" in obj, get: obj => obj.month, set: (obj, value) => { obj.month = value; } }, metadata: _metadata }, _month_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _year_decorators, { kind: "field", name: "year", static: false, private: false, access: { has: obj => "year" in obj, get: obj => obj.year, set: (obj, value) => { obj.year = value; } }, metadata: _metadata }, _year_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _propertySubscriptionId_decorators, { kind: "field", name: "propertySubscriptionId", static: false, private: false, access: { has: obj => "propertySubscriptionId" in obj, get: obj => obj.propertySubscriptionId, set: (obj, value) => { obj.propertySubscriptionId = value; } }, metadata: _metadata }, _propertySubscriptionId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _propertySubscription_decorators, { kind: "field", name: "propertySubscription", static: false, private: false, access: { has: obj => "propertySubscription" in obj, get: obj => obj.propertySubscription, set: (obj, value) => { obj.propertySubscription = value; } }, metadata: _metadata }, _propertySubscription_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Billing = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Billing = _classThis;
})();
exports.Billing = Billing;
