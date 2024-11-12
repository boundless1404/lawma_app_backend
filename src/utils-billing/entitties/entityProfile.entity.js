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
exports.EntityProfile = void 0;
const typeorm_1 = require("typeorm");
const entityProfilePreference_entity_1 = require("./entityProfilePreference.entity");
const entityUserProfile_entity_1 = require("./entityUserProfile.entity");
const propertySubscription_entity_1 = require("./propertySubscription.entity");
const street_entity_1 = require("./street.entity");
const propertyTypes_entity_1 = require("./propertyTypes.entity");
const entitySubscriberProfile_entity_1 = require("./entitySubscriberProfile.entity");
let EntityProfile = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _id_decorators;
    let _id_initializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _entityProfilePreference_decorators;
    let _entityProfilePreference_initializers = [];
    let _entityUserProfiles_decorators;
    let _entityUserProfiles_initializers = [];
    let _propertySubscriptions_decorators;
    let _propertySubscriptions_initializers = [];
    let _streets_decorators;
    let _streets_initializers = [];
    let _propertyTypes_decorators;
    let _propertyTypes_initializers = [];
    let _entitySubscriberProfiles_decorators;
    let _entitySubscriberProfiles_initializers = [];
    var EntityProfile = _classThis = class {
        constructor() {
            this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
            this.name = __runInitializers(this, _name_initializers, void 0);
            // TODO: add lga / ward id
            // relations
            this.entityProfilePreference = __runInitializers(this, _entityProfilePreference_initializers, void 0);
            // @OneToMany(
            //   () => EntitySubscriberProfile,
            //   (entitySubscriberProfile) => entitySubscriberProfile.entityProfile,
            // )
            // entitySubscriberProfiles: EntitySubscriberProfile[];
            this.entityUserProfiles = __runInitializers(this, _entityUserProfiles_initializers, void 0);
            this.propertySubscriptions = __runInitializers(this, _propertySubscriptions_initializers, void 0);
            this.streets = __runInitializers(this, _streets_initializers, void 0);
            this.propertyTypes = __runInitializers(this, _propertyTypes_initializers, void 0);
            this.entitySubscriberProfiles = __runInitializers(this, _entitySubscriberProfiles_initializers, void 0);
        }
    };
    __setFunctionName(_classThis, "EntityProfile");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' })];
        _name_decorators = [(0, typeorm_1.Column)({ type: 'varchar', nullable: false })];
        _entityProfilePreference_decorators = [(0, typeorm_1.OneToOne)(() => entityProfilePreference_entity_1.EntityProfilePreference, (entityProfilePreference) => entityProfilePreference.entityProfile)];
        _entityUserProfiles_decorators = [(0, typeorm_1.OneToMany)(() => entityUserProfile_entity_1.EntityUserProfile, (entityUserProfile) => entityUserProfile.entityProfile)];
        _propertySubscriptions_decorators = [(0, typeorm_1.OneToMany)(() => propertySubscription_entity_1.PropertySubscription, (propertySubscription) => propertySubscription.entityProfile)];
        _streets_decorators = [(0, typeorm_1.OneToMany)(() => street_entity_1.Street, (street) => street.entityProfile)];
        _propertyTypes_decorators = [(0, typeorm_1.ManyToOne)(() => propertyTypes_entity_1.PropertyType, (propertyType) => propertyType.entityProfile)];
        _entitySubscriberProfiles_decorators = [(0, typeorm_1.OneToMany)(() => entitySubscriberProfile_entity_1.EntitySubscriberProfile, (entitySubscriberProfile) => entitySubscriberProfile.entityProfile)];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _entityProfilePreference_decorators, { kind: "field", name: "entityProfilePreference", static: false, private: false, access: { has: obj => "entityProfilePreference" in obj, get: obj => obj.entityProfilePreference, set: (obj, value) => { obj.entityProfilePreference = value; } }, metadata: _metadata }, _entityProfilePreference_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _entityUserProfiles_decorators, { kind: "field", name: "entityUserProfiles", static: false, private: false, access: { has: obj => "entityUserProfiles" in obj, get: obj => obj.entityUserProfiles, set: (obj, value) => { obj.entityUserProfiles = value; } }, metadata: _metadata }, _entityUserProfiles_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _propertySubscriptions_decorators, { kind: "field", name: "propertySubscriptions", static: false, private: false, access: { has: obj => "propertySubscriptions" in obj, get: obj => obj.propertySubscriptions, set: (obj, value) => { obj.propertySubscriptions = value; } }, metadata: _metadata }, _propertySubscriptions_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _streets_decorators, { kind: "field", name: "streets", static: false, private: false, access: { has: obj => "streets" in obj, get: obj => obj.streets, set: (obj, value) => { obj.streets = value; } }, metadata: _metadata }, _streets_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _propertyTypes_decorators, { kind: "field", name: "propertyTypes", static: false, private: false, access: { has: obj => "propertyTypes" in obj, get: obj => obj.propertyTypes, set: (obj, value) => { obj.propertyTypes = value; } }, metadata: _metadata }, _propertyTypes_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _entitySubscriberProfiles_decorators, { kind: "field", name: "entitySubscriberProfiles", static: false, private: false, access: { has: obj => "entitySubscriberProfiles" in obj, get: obj => obj.entitySubscriberProfiles, set: (obj, value) => { obj.entitySubscriberProfiles = value; } }, metadata: _metadata }, _entitySubscriberProfiles_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EntityProfile = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EntityProfile = _classThis;
})();
exports.EntityProfile = EntityProfile;
