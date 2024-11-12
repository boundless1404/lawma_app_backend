"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtilsBillingController = void 0;
const common_1 = require("@nestjs/common");
const isEntityUserAdmin_guard_1 = require("../shared/isEntityUserAdmin.guard");
const isAuthenticated_guard_1 = require("../shared/isAuthenticated.guard");
const enums_1 = require("../lib/enums");
let UtilsBillingController = (() => {
    let _classDecorators = [(0, common_1.Controller)('utils-billing')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _createUser_decorators;
    let _createSubscriberUser_decorators;
    let _getSubscriberUser_decorators;
    let _createSubscription_decorators;
    let _getSubscriptions_decorators;
    let _getSubscriptionDetails_decorators;
    let _savePropertyUnits_decorators;
    let _generateBilling_decorators;
    let _getBilling_decorators;
    let _deleteBilling_decorators;
    let _updateArrears_decorators;
    let _getBillingAccountArrears_decorators;
    let _getBillingPaymentDefaulters_decorators;
    let _getBillingDetails_decorators;
    let _postPayment_decorators;
    let _getPayments_decorators;
    let _createLga_decorators;
    let _getLga_decorators;
    let _createLgaWard_decorators;
    let _getLgaWard_decorators;
    let _createStreet_decorators;
    let _getStreet_decorators;
    let _createPropertyType_decorators;
    let _getPropertyTypes_decorators;
    let _getPhoneCodes_decorators;
    let _getDashboardMetrics_decorators;
    var UtilsBillingController = _classThis = class {
        constructor(utilService) {
            this.utilService = (__runInitializers(this, _instanceExtraInitializers), utilService);
            //
        }
        // create user
        // would create both entity user and subscriber user
        // differentiate with a flag
        createUser(createUserDto, authPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.utilService.createUser(createUserDto, authPayload);
            });
        }
        createSubscriberUser(createUserDto, authPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                // update the profileType
                createUserDto.profileType = enums_1.ProfileTypes.ENTITY_SUBSCRIBER_PROFILE;
                yield this.utilService.createUser(createUserDto, authPayload);
            });
        }
        getSubscriberUser(authPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                //
                return yield this.utilService.getEntityUserSubscriber(authPayload.profile.entityProfileId);
            });
        }
        createSubscription(createSubscriptionDto, authPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                //
                yield this.utilService.createPropertySubscription(createSubscriptionDto, authPayload);
            });
        }
        getSubscriptions(getSubscriptionQuery, authPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                //
                return yield this.utilService.getSubscriptions(authPayload.profile.entityProfileId, {
                    rowsPerPage: Number(getSubscriptionQuery.rowsPerPage || 10),
                    page: Number(getSubscriptionQuery.page || 1),
                    descending: JSON.parse(getSubscriptionQuery.descending || 'false'),
                    filter: getSubscriptionQuery.filter,
                    sortBy: getSubscriptionQuery.sortBy,
                    streetId: getSubscriptionQuery.streetId,
                });
            });
        }
        getSubscriptionDetails(query, authPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.utilService.getSubscriptionDetails(authPayload.profile.entityProfileId, query.propertySubscriptionId);
            });
        }
        savePropertyUnits(authPayload, propertyUnits) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.utilService.savePropertyUnits(authPayload.profile.entityProfileId, propertyUnits);
                return;
            });
        }
        generateBilling(generateBillingDto, authPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.utilService.generateBilling(generateBillingDto, authPayload.profile.entityProfileId);
            });
        }
        getBilling(getBillingQuery, authPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.utilService.getBilling(getBillingQuery, authPayload.profile.entityProfileId);
            });
        }
        deleteBilling(billingId, authTokenPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.utilService.deleteBilling({
                    billingId,
                    entityProfileId: authTokenPayload.profile.entityProfileId,
                });
            });
        }
        updateArrears(UpdateArrearsDto, authTokenPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.utilService.updateArrears({
                    billingArrears: UpdateArrearsDto.arrears,
                    propertySubscriptionId: UpdateArrearsDto.propertySubscriptionId,
                    entityProfileId: authTokenPayload.profile.entityProfileId,
                    entityUserProfileId: authTokenPayload.profile.id,
                    reason: UpdateArrearsDto.reason,
                });
            });
        }
        getBillingAccountArrears(query, authPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.utilService.getBillingAccountArrears(authPayload.profile.entityProfileId, query);
            });
        }
        getBillingPaymentDefaulters(streetId, authPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.utilService.getBillingDetailsOrDefaulters(authPayload.profile.entityProfileId, { streetId });
            });
        }
        getBillingDetails(streetId, { billingMonth, propertySubscriptionId }, authPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.utilService.getBillingDetailsOrDefaulters(authPayload.profile.entityProfileId, { streetId, billingMonth, propertySubscriptionId });
            });
        }
        postPayment(postPaymentDto, authPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.utilService.postPayment(postPaymentDto, authPayload.profile.entityProfileId);
            });
        }
        getPayments(query, authPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.utilService.getPayments(Object.assign(Object.assign({}, query), { entityProfileId: authPayload.profile.entityProfileId }));
            });
        }
        createLga(createLgaDto) {
            return __awaiter(this, void 0, void 0, function* () {
                //
                yield this.utilService.createLga(createLgaDto);
            });
        }
        getLga(query) {
            return __awaiter(this, void 0, void 0, function* () {
                //
                return yield this.utilService.getLgas(query.name);
            });
        }
        createLgaWard(createLgaWardDto) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.utilService.createLgaWard(createLgaWardDto);
            });
        }
        getLgaWard(query) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.utilService.getLgaWards(Object.assign({}, query));
            });
        }
        createStreet(createStreetDto, authPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.utilService.createStreet(createStreetDto, authPayload);
            });
        }
        getStreet(query, authPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.utilService.getStreets(authPayload.profile.entityProfileId, Object.assign({}, query));
            });
        }
        createPropertyType(createPropertyTypeDto, authPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                //
                yield this.utilService.createPropertyType(createPropertyTypeDto, authPayload.profile.entityProfileId);
            });
        }
        getPropertyTypes(query, authPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.utilService.getPropertyTypes(authPayload.profile.entityProfileId, Object.assign({}, query));
            });
        }
        getPhoneCodes(query) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.utilService.getPhoneCode(query);
            });
        }
        getDashboardMetrics(authPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.utilService.getDashboardMetrics(authPayload.profile.entityProfileId);
            });
        }
    };
    __setFunctionName(_classThis, "UtilsBillingController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _createUser_decorators = [(0, common_1.Post)('user'), (0, common_1.UseGuards)(new isEntityUserAdmin_guard_1.IsEntityUserAdmin())];
        _createSubscriberUser_decorators = [(0, common_1.Post)('subscriber-user'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _getSubscriberUser_decorators = [(0, common_1.Get)('subscriber-user'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _createSubscription_decorators = [(0, common_1.Post)('subscription'), (0, common_1.UseGuards)(new isEntityUserAdmin_guard_1.IsEntityUserAdmin())];
        _getSubscriptions_decorators = [(0, common_1.Get)('subscription'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _getSubscriptionDetails_decorators = [(0, common_1.Get)('subscription/details'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _savePropertyUnits_decorators = [(0, common_1.Put)('subscription/property-units'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _generateBilling_decorators = [(0, common_1.Post)('billing'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _getBilling_decorators = [(0, common_1.Get)('billing'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _deleteBilling_decorators = [(0, common_1.Delete)('billing'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _updateArrears_decorators = [(0, common_1.Put)('billing/account'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _getBillingAccountArrears_decorators = [(0, common_1.Get)('billing/account/arrears'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _getBillingPaymentDefaulters_decorators = [(0, common_1.Get)('billing/account/street/:streetId/defaulter'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _getBillingDetails_decorators = [(0, common_1.Get)('billing/account/street/:streetId/detail'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _postPayment_decorators = [(0, common_1.Post)('payment'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _getPayments_decorators = [(0, common_1.Get)('payment'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _createLga_decorators = [(0, common_1.Post)('lga'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _getLga_decorators = [(0, common_1.Get)('lga'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _createLgaWard_decorators = [(0, common_1.Post)('lga-ward'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _getLgaWard_decorators = [(0, common_1.Get)('lga-ward'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _createStreet_decorators = [(0, common_1.Post)('street'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _getStreet_decorators = [(0, common_1.Get)('street'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _createPropertyType_decorators = [(0, common_1.Post)('property-type'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _getPropertyTypes_decorators = [(0, common_1.Get)('property-type'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _getPhoneCodes_decorators = [(0, common_1.Get)('phone-code'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        _getDashboardMetrics_decorators = [(0, common_1.Get)('/dashboard/metrics'), (0, common_1.UseGuards)(isAuthenticated_guard_1.IsAuthenticated)];
        __esDecorate(_classThis, null, _createUser_decorators, { kind: "method", name: "createUser", static: false, private: false, access: { has: obj => "createUser" in obj, get: obj => obj.createUser }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createSubscriberUser_decorators, { kind: "method", name: "createSubscriberUser", static: false, private: false, access: { has: obj => "createSubscriberUser" in obj, get: obj => obj.createSubscriberUser }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSubscriberUser_decorators, { kind: "method", name: "getSubscriberUser", static: false, private: false, access: { has: obj => "getSubscriberUser" in obj, get: obj => obj.getSubscriberUser }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createSubscription_decorators, { kind: "method", name: "createSubscription", static: false, private: false, access: { has: obj => "createSubscription" in obj, get: obj => obj.createSubscription }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSubscriptions_decorators, { kind: "method", name: "getSubscriptions", static: false, private: false, access: { has: obj => "getSubscriptions" in obj, get: obj => obj.getSubscriptions }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSubscriptionDetails_decorators, { kind: "method", name: "getSubscriptionDetails", static: false, private: false, access: { has: obj => "getSubscriptionDetails" in obj, get: obj => obj.getSubscriptionDetails }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _savePropertyUnits_decorators, { kind: "method", name: "savePropertyUnits", static: false, private: false, access: { has: obj => "savePropertyUnits" in obj, get: obj => obj.savePropertyUnits }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _generateBilling_decorators, { kind: "method", name: "generateBilling", static: false, private: false, access: { has: obj => "generateBilling" in obj, get: obj => obj.generateBilling }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBilling_decorators, { kind: "method", name: "getBilling", static: false, private: false, access: { has: obj => "getBilling" in obj, get: obj => obj.getBilling }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteBilling_decorators, { kind: "method", name: "deleteBilling", static: false, private: false, access: { has: obj => "deleteBilling" in obj, get: obj => obj.deleteBilling }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateArrears_decorators, { kind: "method", name: "updateArrears", static: false, private: false, access: { has: obj => "updateArrears" in obj, get: obj => obj.updateArrears }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBillingAccountArrears_decorators, { kind: "method", name: "getBillingAccountArrears", static: false, private: false, access: { has: obj => "getBillingAccountArrears" in obj, get: obj => obj.getBillingAccountArrears }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBillingPaymentDefaulters_decorators, { kind: "method", name: "getBillingPaymentDefaulters", static: false, private: false, access: { has: obj => "getBillingPaymentDefaulters" in obj, get: obj => obj.getBillingPaymentDefaulters }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBillingDetails_decorators, { kind: "method", name: "getBillingDetails", static: false, private: false, access: { has: obj => "getBillingDetails" in obj, get: obj => obj.getBillingDetails }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _postPayment_decorators, { kind: "method", name: "postPayment", static: false, private: false, access: { has: obj => "postPayment" in obj, get: obj => obj.postPayment }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPayments_decorators, { kind: "method", name: "getPayments", static: false, private: false, access: { has: obj => "getPayments" in obj, get: obj => obj.getPayments }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createLga_decorators, { kind: "method", name: "createLga", static: false, private: false, access: { has: obj => "createLga" in obj, get: obj => obj.createLga }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getLga_decorators, { kind: "method", name: "getLga", static: false, private: false, access: { has: obj => "getLga" in obj, get: obj => obj.getLga }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createLgaWard_decorators, { kind: "method", name: "createLgaWard", static: false, private: false, access: { has: obj => "createLgaWard" in obj, get: obj => obj.createLgaWard }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getLgaWard_decorators, { kind: "method", name: "getLgaWard", static: false, private: false, access: { has: obj => "getLgaWard" in obj, get: obj => obj.getLgaWard }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createStreet_decorators, { kind: "method", name: "createStreet", static: false, private: false, access: { has: obj => "createStreet" in obj, get: obj => obj.createStreet }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStreet_decorators, { kind: "method", name: "getStreet", static: false, private: false, access: { has: obj => "getStreet" in obj, get: obj => obj.getStreet }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createPropertyType_decorators, { kind: "method", name: "createPropertyType", static: false, private: false, access: { has: obj => "createPropertyType" in obj, get: obj => obj.createPropertyType }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPropertyTypes_decorators, { kind: "method", name: "getPropertyTypes", static: false, private: false, access: { has: obj => "getPropertyTypes" in obj, get: obj => obj.getPropertyTypes }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPhoneCodes_decorators, { kind: "method", name: "getPhoneCodes", static: false, private: false, access: { has: obj => "getPhoneCodes" in obj, get: obj => obj.getPhoneCodes }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getDashboardMetrics_decorators, { kind: "method", name: "getDashboardMetrics", static: false, private: false, access: { has: obj => "getDashboardMetrics" in obj, get: obj => obj.getDashboardMetrics }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UtilsBillingController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UtilsBillingController = _classThis;
})();
exports.UtilsBillingController = UtilsBillingController;
