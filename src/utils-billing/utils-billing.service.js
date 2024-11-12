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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtilsBillingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const enums_1 = require("../lib/enums");
const helpers_1 = require("../utils/helpers");
const entitySubscriberProfile_entity_1 = require("./entitties/entitySubscriberProfile.entity");
const entityUserProfile_entity_1 = require("./entitties/entityUserProfile.entity");
const street_entity_1 = require("./entitties/street.entity");
const propertyTypes_entity_1 = require("./entitties/propertyTypes.entity");
const propertySubscription_entity_1 = require("./entitties/propertySubscription.entity");
const entitySubscriberProperty_entity_1 = require("./entitties/entitySubscriberProperty.entity");
const PropertySubscriptionUnit_entity_1 = require("./entitties/PropertySubscriptionUnit.entity");
const billingAccount_entity_1 = require("./entitties/billingAccount.entity");
const billing_entity_1 = require("./entitties/billing.entity");
const projectConstants_1 = require("../lib/projectConstants");
const mathjs_1 = require("mathjs");
const lgaWard_entity_1 = require("./entitties/lgaWard.entity");
const lga_entity_1 = require("./entitties/lga.entity");
const payments_entity_1 = require("./entitties/payments.entity");
const profileCollection_entity_1 = require("./entitties/profileCollection.entity");
const phoneCode_entity_1 = require("./entitties/phoneCode.entity");
const lodash_1 = require("lodash");
const class_validator_1 = require("class-validator");
const arrearsUpdates_entity_1 = __importDefault(require("./entitties/arrearsUpdates.entity"));
let UtilsBillingService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var UtilsBillingService = _classThis = class {
        constructor(requestService, dbManager, dataSource) {
            this.requestService = requestService;
            this.dbManager = dbManager;
            this.dataSource = dataSource;
            //
            if (!dbManager) {
                if (!dataSource) {
                    throw new Error('No data source found');
                }
                this.dbManager = dataSource.manager;
                this.dataSource = dataSource;
            }
            else {
                this.dbManager = dbManager;
            }
        }
        createUser(createUserDto, authPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                const { profileType } = createUserDto;
                if (![
                    enums_1.ProfileTypes.ENTITY_SUBSCRIBER_PROFILE,
                    enums_1.ProfileTypes.ENTITY_USER_PROFILE,
                ].includes(profileType)) {
                    (0, helpers_1.throwBadRequest)('Invalid profile');
                }
                delete createUserDto.profileType;
                const entityProfileId = authPayload.profile.entityProfileId;
                const phoneCode = yield this.getPhoneCodeOrThrow({
                    phoneCodeId: createUserDto.phoneCodeId,
                });
                // create user in central user manager
                const authServerRequestPath = `/project/app/signup`;
                const defaultPassword = 'no-password';
                const phoneNumber = createUserDto.phone;
                const response = yield this.requestService.requestAuth(authServerRequestPath, {
                    body: Object.assign(Object.assign({ firstName: createUserDto.firstName, lastName: createUserDto.lastName, email: createUserDto.email, password: defaultPassword }, (phoneNumber ? { phone: `${phoneNumber}` } : {})), (phoneNumber ? { phoneCode: `${phoneCode.name}` } : {})),
                    method: 'POST',
                });
                if (response.status !== 201) {
                    throw new common_1.HttpException('User creation failed', 500);
                }
                const userData = response.data;
                if (!userData) {
                    throw new common_1.HttpException('User creation failed', 500);
                }
                if (!userData.isNewUser && !userData.userCreatedInApp) {
                    (0, helpers_1.throwForbidden)('User already exist!');
                }
                let userProfile;
                if (profileType === enums_1.ProfileTypes.ENTITY_USER_PROFILE) {
                    userProfile = this.dbManager.create(entityUserProfile_entity_1.EntityUserProfile, Object.assign(Object.assign({}, createUserDto), { entityProfileId }));
                    yield this.dbManager.save(userProfile);
                }
                else if (profileType === enums_1.ProfileTypes.ENTITY_SUBSCRIBER_PROFILE) {
                    userProfile = this.dbManager.create(entitySubscriberProfile_entity_1.EntitySubscriberProfile, Object.assign(Object.assign({}, createUserDto), { createdByEntityProfileId: entityProfileId, createdByEntityUserProfileId: authPayload.profile.profileTypeId }));
                    yield this.dbManager.save(userProfile);
                }
                const profileCollection = this.dbManager.create(profileCollection_entity_1.ProfileCollection, {
                    profileType,
                    userId: userData.id,
                    isAdmin: false,
                    profileTypeId: userProfile.id,
                });
                yield this.dbManager.save(profileCollection);
            });
        }
        getEntityUserSubscriber(entityProfileId, { query, page, count = 10, } = {}) {
            return __awaiter(this, void 0, void 0, function* () {
                let entitySubscriberProfiles = [];
                entitySubscriberProfiles = yield this.dbManager.find(entitySubscriberProfile_entity_1.EntitySubscriberProfile, {
                    where: {
                        createdByEntityUserProfileId: entityProfileId,
                    },
                });
                return entitySubscriberProfiles;
            });
        }
        createPropertySubscription(createSubscriptionDto, authPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                // verify streetId, propertyTypeId, propertySubscriberProfileId, oldCode.
                yield this.getStreetOrThrowError({
                    streetId: createSubscriptionDto.streetId,
                });
                // verify propertyTypeId
                yield this.getPropertyTypeOrThrowError({
                    propertyTypeId: createSubscriptionDto.propertyTypeId,
                });
                // verify oldCode
                const existingOldCode = yield this.dbManager.findOne(propertySubscription_entity_1.PropertySubscription, {
                    where: {
                        oldCode: createSubscriptionDto.oldCode,
                    },
                });
                if (existingOldCode) {
                    (0, helpers_1.throwBadRequest)('Old code supplied has been used.');
                }
                // verify propertySubscriberProfileId
                yield this.validateEntitySubscriberProfileById(createSubscriptionDto.propertySubscriberProfileId);
                const subscriberProfileRole = createSubscriptionDto.isOwner
                    ? enums_1.SubscriberProfileRoleEnum.OWNER
                    : enums_1.SubscriberProfileRoleEnum.CUSTODIAN;
                yield this.dbManager.transaction((transactionManager) => __awaiter(this, void 0, void 0, function* () {
                    // create subscriber property
                    let subscriberProperty = transactionManager.create(entitySubscriberProperty_entity_1.EntitySubscriberProperty, Object.assign({ propertyTypeId: createSubscriptionDto.propertyTypeId }, (createSubscriptionDto.isOwner
                        ? {
                            ownerEntitySubscriberProfileId: createSubscriptionDto.propertySubscriberProfileId,
                        }
                        : {})));
                    subscriberProperty = yield transactionManager.save(subscriberProperty);
                    // create property subscription
                    let propertySubscription = transactionManager.create(propertySubscription_entity_1.PropertySubscription, {
                        propertySubscriptionName: createSubscriptionDto.propertyName,
                        oldCode: createSubscriptionDto.oldCode,
                        streetNumber: createSubscriptionDto.streetNumber,
                        streetId: createSubscriptionDto.streetId,
                        entitySubscriberProfileId: createSubscriptionDto.propertySubscriberProfileId,
                        subscriberProfileRole: subscriberProfileRole,
                        entityProfileId: authPayload.profile.entityProfileId,
                    });
                    propertySubscription = yield transactionManager.save(propertySubscription);
                    const propertySubscriptionId = propertySubscription.id;
                    // create property unit
                    const propertySubscriptionUnit = transactionManager.create(PropertySubscriptionUnit_entity_1.PropertySubscriptionUnit, {
                        propertySubscriptionId,
                        entiySubscriberPropertyId: subscriberProperty.id,
                        propertyUnits: createSubscriptionDto.propertyUnit,
                    });
                    yield transactionManager.save(propertySubscriptionUnit);
                    // create billling account
                    const billingAccount = transactionManager.create(billingAccount_entity_1.BillingAccount, {
                        propertySubscriptionId,
                    });
                    yield transactionManager.save(billingAccount);
                }));
            });
        }
        getSubscriptions(entityProfileId, { rowsPerPage = 10, page = 1, streetId, descending, filter, sortBy, } = {}) {
            return __awaiter(this, void 0, void 0, function* () {
                //
                // let filterBy = filter ? JSON.parse(filter) : null;
                const [propertySubscriptions, rowsNumber] = yield this.dbManager.findAndCount(propertySubscription_entity_1.PropertySubscription, Object.assign(Object.assign(Object.assign({ where: filter
                        ? (0, class_validator_1.isNumberString)(filter)
                            ? [
                                // {
                                //   entityProfileId,
                                //   // billingAccount: {
                                //   //   totalBillings: Raw(
                                //   //     ($alias) => `${$alias} >= "totalPayments" + ${filter}`,
                                //   //   ),
                                //   // },
                                // },
                                {
                                    entityProfileId,
                                    oldCode: filter,
                                },
                                {
                                    entityProfileId,
                                    id: filter,
                                },
                            ]
                            : [
                                {
                                    entityProfileId,
                                    street: { name: (0, typeorm_1.ILike)(`%${filter}%`) },
                                },
                                {
                                    entityProfileId,
                                    propertySubscriptionName: (0, typeorm_1.ILike)(`%${filter}%`),
                                },
                            ]
                        : Object.assign({ entityProfileId }, (streetId ? { streetId } : {})) }, (!streetId
                    ? { take: rowsPerPage, skip: (page - 1) * rowsPerPage }
                    : {})), { relations: {
                        propertySubscriptionUnits: {
                            entitySubscriberProperty: {
                                propertyType: true,
                            },
                        },
                        billingAccount: true,
                        entitySubscriberProfile: {
                            phoneCode: true,
                        },
                        street: true,
                    } }), (sortBy ? { order: { [sortBy]: descending ? 'DESC' : 'ASC' } } : {})));
                const mappedResponse = propertySubscriptions.map((sub) => {
                    var _a, _b, _c, _d, _e;
                    return {
                        propertySubscriptionId: sub.id,
                        propertySubscriptionName: sub.propertySubscriptionName,
                        oldCode: sub.oldCode,
                        streetNumber: sub.streetNumber,
                        createdAt: sub.createdAt,
                        streetId: sub.streetId,
                        entitySubscriberProfileId: sub.entitySubscriberProfileId,
                        propertySubscriptionUnits: (_a = sub.propertySubscriptionUnits) === null || _a === void 0 ? void 0 : _a.map((unit) => {
                            var _a, _b, _c;
                            return {
                                entitySubscriberPropertyId: (_a = unit.entitySubscriberProperty) === null || _a === void 0 ? void 0 : _a.id,
                                createdAt: (_b = unit.entitySubscriberProperty) === null || _b === void 0 ? void 0 : _b.createdAt,
                                propertyType: Object.assign(Object.assign({}, (_c = unit.entitySubscriberProperty) === null || _c === void 0 ? void 0 : _c.propertyType), { updatedAt: undefined, entityProfileId: undefined }),
                            };
                        }),
                        arrears: (() => {
                            let arr = Number(sub.billingAccount.totalBillings || '0') -
                                Number(sub.billingAccount.totalPayments || '0');
                            arr = arr < 0 ? 0 : arr;
                            return arr;
                        })(),
                        entitySubscriberProfile: Object.assign(Object.assign({}, sub.entitySubscriberProfile), { updatedAt: undefined, phone: (_b = sub.entitySubscriberProfile) === null || _b === void 0 ? void 0 : _b.phone, phoneCode: (_d = (_c = sub.entitySubscriberProfile) === null || _c === void 0 ? void 0 : _c.phoneCode) === null || _d === void 0 ? void 0 : _d.name }),
                        streetName: (_e = sub.street) === null || _e === void 0 ? void 0 : _e.name,
                    };
                });
                return {
                    data: mappedResponse,
                    pagination: { rowsNumber, rowsPerPage, page, sortBy, descending },
                    filter,
                };
            });
        }
        createPropertyType(createPropertyTypesDto, entityProfileId) {
            return __awaiter(this, void 0, void 0, function* () {
                //
                let propertyType = yield this.dbManager.findOne(propertyTypes_entity_1.PropertyType, {
                    where: {
                        id: createPropertyTypesDto.id,
                    },
                });
                if (propertyType) {
                    propertyType.name = createPropertyTypesDto.name;
                    propertyType.unitPrice = createPropertyTypesDto.unitPrice;
                }
                else {
                    propertyType = this.dbManager.create(propertyTypes_entity_1.PropertyType, {
                        unitPrice: createPropertyTypesDto.unitPrice,
                        name: createPropertyTypesDto.name,
                        entityProfileId,
                    });
                }
                yield this.dbManager.save(propertyType);
            });
        }
        getPropertyTypes(entityProfileId, { name, unitPrice } = {}) {
            return __awaiter(this, void 0, void 0, function* () {
                //
                const propertyTypes = name || unitPrice
                    ? yield this.dbManager.find(propertyTypes_entity_1.PropertyType, {
                        where: Object.assign(Object.assign({ entityProfileId }, (name ? { name } : {})), (unitPrice ? { unitPrice } : {})),
                    })
                    : yield this.dbManager.find(propertyTypes_entity_1.PropertyType, {
                        where: {
                            entityProfileId,
                        },
                    });
                return propertyTypes;
            });
        }
        getBillingsByMonth(propertySubscriptionId, month, year, entityProfileId) {
            return __awaiter(this, void 0, void 0, function* () {
                //
                const billings = yield this.dbManager.find(billing_entity_1.Billing, {
                    where: Object.assign({ propertySubscriptionId,
                        month,
                        year }, (entityProfileId ? { entityProfileId } : {})),
                    relations: {
                        propertySubscription: {
                            propertySubscriptionUnits: true,
                            billingAccount: true,
                            payments: true,
                        },
                    },
                });
                const mappedBilling = billings.map((bill) => {
                    var _a, _b;
                    return {
                        billing: {
                            id: bill.id,
                            amount: bill.amount,
                            month: bill.month,
                            year: bill.year,
                        },
                        arreas: bill.propertySubscription.billingAccount.totalBillings,
                        propertySubscriptionUnits: bill.propertySubscription.propertySubscriptionUnits.map((propertySubscriptionUnit) => {
                            return {
                                propertyType: propertySubscriptionUnit.entitySubscriberProperty.propertyType
                                    .name,
                                unitPrice: propertySubscriptionUnit.entitySubscriberProperty.propertyType
                                    .unitPrice,
                                unitCount: propertySubscriptionUnit.propertyUnits,
                            };
                        }),
                        lastPayment: {
                            amount: (_a = bill.propertySubscription.payments.pop()) === null || _a === void 0 ? void 0 : _a.amount,
                            date: (_b = bill.propertySubscription.payments.pop()) === null || _b === void 0 ? void 0 : _b.createdAt,
                        },
                    };
                });
                return mappedBilling;
            });
        }
        deleteBilling({ entityProfileId, billingId, }) {
            return __awaiter(this, void 0, void 0, function* () {
                const billingToDelete = yield this.dbManager.findOne(billing_entity_1.Billing, {
                    where: {
                        id: billingId,
                        propertySubscription: {
                            entityProfileId,
                        },
                    },
                });
                if (billingToDelete) {
                    yield this.dbManager.delete(billing_entity_1.Billing, { id: billingId });
                }
            });
        }
        updateArrears({ entityProfileId, entityUserProfileId, billingArrears, propertySubscriptionId, }) {
            return __awaiter(this, void 0, void 0, function* () {
                const associatedBillingAccount = yield this.dbManager.findOne(billingAccount_entity_1.BillingAccount, {
                    where: {
                        propertySubscription: {
                            id: propertySubscriptionId,
                            entityProfileId,
                        },
                    },
                });
                if (!associatedBillingAccount) {
                    (0, helpers_1.throwBadRequest)('Could not find the referenced billing Account');
                }
                let currentArrears = (0, mathjs_1.bignumber)(associatedBillingAccount.totalBillings)
                    .minus(associatedBillingAccount.totalPayments)
                    .toNumber();
                currentArrears = currentArrears > 0 ? currentArrears : 0;
                const newArrears = (0, mathjs_1.bignumber)(billingArrears).toNumber();
                /// update billing acount: if newArrears > currentArrears add difference to account's total billing
                const arrearsDifference = newArrears - currentArrears;
                if (arrearsDifference >= 0) {
                    associatedBillingAccount.totalBillings = String((0, mathjs_1.bignumber)(associatedBillingAccount.totalBillings).add(arrearsDifference));
                }
                else {
                    associatedBillingAccount.totalPayments = String((0, mathjs_1.bignumber)(associatedBillingAccount.totalPayments).add(Math.abs(arrearsDifference)));
                }
                yield this.dbManager.save(associatedBillingAccount);
                // track arrears update
                const arrearsUpdate = this.dbManager.create(arrearsUpdates_entity_1.default, {
                    amountAfterUpdate: newArrears.toString(),
                    amountBeforeUpdate: currentArrears.toString(),
                    reasonToUpdate: '',
                    propertySubscriptionId: propertySubscriptionId,
                    updatedByUserId: entityProfileId
                });
            });
        }
        generateBilling(generatePrintBIllingDto, entityProfileId) {
            return __awaiter(this, void 0, void 0, function* () {
                // check if to generate for all properties
                if (generatePrintBIllingDto.forAllProperties) {
                    (0, helpers_1.throwBadRequest)('This is currently not available.');
                }
                else if (generatePrintBIllingDto.forPropertiesOnStreet) {
                    // TODO: handle this
                    const properties = yield this.dbManager.find(propertySubscription_entity_1.PropertySubscription, {
                        where: {
                            streetId: generatePrintBIllingDto.streetId,
                            entityProfileId,
                        },
                    });
                    yield this.dbManager.transaction((transactionManager) => __awaiter(this, void 0, void 0, function* () {
                        yield Promise.all(properties.map((prop) => __awaiter(this, void 0, void 0, function* () {
                            yield this.generateMonthBilling(prop.id, generatePrintBIllingDto.month, {
                                year: generatePrintBIllingDto.year,
                                throwError: false,
                                transactionManager,
                            });
                        })));
                    }));
                }
                else {
                    //
                    yield this.generateMonthBilling(generatePrintBIllingDto.propertySuscriptionId, generatePrintBIllingDto.month, {
                        year: generatePrintBIllingDto.year,
                        transactionManager: this.dbManager,
                    });
                }
            });
        }
        getBilling(generatePrintBIllingDto, entityProfileId) {
            return __awaiter(this, void 0, void 0, function* () {
                //
                if (generatePrintBIllingDto.forAllProperties) {
                    //
                    (0, helpers_1.throwBadRequest)('This is currently not available.');
                }
                else if (generatePrintBIllingDto.forPropertiesOnStreet ||
                    generatePrintBIllingDto.streetId) {
                    const properties = yield this.dbManager.find(propertySubscription_entity_1.PropertySubscription, {
                        where: {
                            streetId: generatePrintBIllingDto.streetId,
                            entityProfileId,
                        },
                    });
                    const billings = yield Promise.all(properties.map((prop) => __awaiter(this, void 0, void 0, function* () {
                        yield this.getBillingsByMonth(prop.id, generatePrintBIllingDto.month, generatePrintBIllingDto.year);
                    })));
                    return billings;
                }
                else {
                    const billings = yield this.getBillingsByMonth(generatePrintBIllingDto.propertySuscriptionId, generatePrintBIllingDto.month, generatePrintBIllingDto.month, entityProfileId);
                    return billings;
                }
            });
        }
        generateMonthBilling(propertySubscriptionId, month, { year, throwError = true, transactionManager, }) {
            return __awaiter(this, void 0, void 0, function* () {
                //
                const dbManager = transactionManager;
                const propertySubscription = yield dbManager.findOne(propertySubscription_entity_1.PropertySubscription, {
                    where: {
                        id: propertySubscriptionId,
                    },
                });
                if (!propertySubscription) {
                    (0, helpers_1.throwBadRequest)('Property subscription not found.');
                }
                const billingAccount = yield dbManager.findOne(billingAccount_entity_1.BillingAccount, {
                    where: {
                        propertySubscriptionId,
                    },
                });
                if (!billingAccount) {
                    (0, helpers_1.throwBadRequest)('Billing account not found.');
                }
                const billingAlreadyGenerated = yield dbManager.findOne(billing_entity_1.Billing, {
                    where: {
                        propertySubscriptionId: propertySubscription.id,
                        month: month || this.getMonthName(),
                        year: year || new Date().getFullYear().toString(),
                    },
                });
                if (billingAlreadyGenerated) {
                    if (!throwError) {
                        return null;
                    }
                    (0, helpers_1.throwBadRequest)(`Billing already generated for ${propertySubscription.propertySubscriptionName}.`);
                }
                const propertySubscriptionUnits = yield dbManager.find(PropertySubscriptionUnit_entity_1.PropertySubscriptionUnit, {
                    where: {
                        propertySubscriptionId,
                    },
                    relations: {
                        entitySubscriberProperty: {
                            propertyType: true,
                        },
                    },
                });
                const billingAmount = this.calculateBillingAmount(propertySubscriptionUnits);
                const currentBilling = dbManager.create(billing_entity_1.Billing, {
                    propertySubscriptionId: propertySubscription.id,
                    month: month || this.getMonthName(),
                    year: year || new Date().getFullYear().toString(),
                    amount: billingAmount.toString(),
                });
                yield dbManager.save(currentBilling);
                // update billing account
                // TODO: use bigNumber form math js
                billingAccount.totalBillings = (0, mathjs_1.bignumber)(billingAccount.totalBillings)
                    .add(currentBilling.amount)
                    .toString();
                yield dbManager.save(billingAccount);
            });
        }
        calculateBillingAmount(propertyUnits) {
            return propertyUnits.reduce((total, propertySubscriptionUnit) => {
                return (total +
                    propertySubscriptionUnit.propertyUnits *
                        (Number(propertySubscriptionUnit.entitySubscriberProperty.propertyType
                            .unitPrice) || 0));
            }, 0);
        }
        getBillingAccountArrears(entityProfileId, { limit = 5, page = 1, month = this.getMonthName(), year = new Date().getFullYear().toString(), } = {}) {
            return __awaiter(this, void 0, void 0, function* () {
                const streetsOwnedByEntity = yield this.dbManager.find(street_entity_1.Street, {
                    where: Object.assign({ entityProfileId }, (month
                        ? {
                            propertySubscriptions: {
                                billings: {
                                    month,
                                    year,
                                },
                            },
                        }
                        : {})),
                    relations: {
                        propertySubscriptions: {
                            billingAccount: true,
                            billings: true,
                        },
                    },
                    take: limit,
                    skip: (page - 1) * limit,
                });
                const mappedStreetsAndArrears = streetsOwnedByEntity.map((street) => {
                    return {
                        streetId: street.id,
                        streetName: street.name,
                        totalBilling: street.propertySubscriptions.reduce((total, sub) => {
                            return total + Number(sub.billingAccount.totalBillings || 0);
                        }, 0),
                        arrears: street.propertySubscriptions.reduce((total, sub) => {
                            const currentArrears = Number(sub.billingAccount.totalBillings || 0) -
                                Number(sub.billingAccount.totalPayments || 0);
                            total += currentArrears > 0 ? currentArrears : 0;
                            return total;
                        }, 0),
                    };
                });
                return mappedStreetsAndArrears;
            });
        }
        getSubscriptionDetails(entityProfileId, propertySubscriptionId) {
            return __awaiter(this, void 0, void 0, function* () {
                // get property subsription for the current profile and the provided subscription id
                if (!entityProfileId || !propertySubscriptionId) {
                    (0, helpers_1.throwBadRequest)('Kindly, provide a valid property reference.');
                }
                const propertySubscription = yield this.dbManager.findOne(propertySubscription_entity_1.PropertySubscription, {
                    where: {
                        id: propertySubscriptionId,
                        entityProfileId,
                    },
                    relations: {
                        payments: true,
                        billingAccount: true,
                        entitySubscriberProfile: {
                            phoneCode: true,
                        },
                        propertySubscriptionUnits: {
                            entitySubscriberProperty: {
                                propertyType: true,
                            },
                        },
                        street: true,
                    },
                });
                return propertySubscription;
            });
        }
        savePropertyUnits(entityProfileId, propertyUnitsDetails) {
            return __awaiter(this, void 0, void 0, function* () {
                // deduplicate record
                const propertyUnitsTypesDto = propertyUnitsDetails.propertySubscriptionUnits;
                // check if propertyType has no duplicate
                // identity and remove possible duplicates
                const uniquePropertyTypes = {};
                propertyUnitsDetails.propertySubscriptionUnits =
                    propertyUnitsTypesDto.filter((eachUnitTypeDto) => {
                        if (eachUnitTypeDto.propertyType.trim() === '') {
                            return false;
                        }
                        const isUnique = !uniquePropertyTypes[eachUnitTypeDto.propertyType];
                        if (isUnique) {
                            uniquePropertyTypes[eachUnitTypeDto.propertyType] = eachUnitTypeDto;
                        }
                        return isUnique;
                    });
                //
                const propertySubscription = yield this.dbManager.findOne(propertySubscription_entity_1.PropertySubscription, {
                    where: {
                        id: propertyUnitsDetails.propertySubscriptionId,
                        entityProfileId,
                    },
                    relations: {
                        propertySubscriptionUnits: {
                            entitySubscriberProperty: {
                                propertyType: true,
                            },
                        },
                    },
                });
                if (!propertySubscription) {
                    (0, helpers_1.throwBadRequest)('Invalide Parameters received.');
                }
                const savedPropertyUnits = propertySubscription.propertySubscriptionUnits;
                const exitingPropertyUnitTypes = [];
                const propertyUnitsToRemove = [];
                const existingPropertyUnitsAndType = savedPropertyUnits.filter((eachPropertyUnit) => {
                    const existingUnitMatch = propertyUnitsDetails.propertySubscriptionUnits.findIndex((eachSubcriptionUnit) => eachSubcriptionUnit.propertyTypeId ===
                        eachPropertyUnit.entitySubscriberProperty.propertyType.id) !== -1;
                    if (!existingUnitMatch) {
                        propertyUnitsToRemove.push(eachPropertyUnit);
                    }
                    else {
                        const propertyUnitDto = propertyUnitsDetails.propertySubscriptionUnits.find((eachDto) => eachDto.propertyType.toLocaleLowerCase() ===
                            eachPropertyUnit.entitySubscriberProperty.propertyType.name.toLocaleLowerCase());
                        exitingPropertyUnitTypes.push(propertyUnitDto);
                    }
                    return existingUnitMatch;
                });
                const newPropertyUnitsTypes = propertyUnitsDetails.propertySubscriptionUnits.filter((eachUnitDto) => exitingPropertyUnitTypes.findIndex((eachUnitType) => eachUnitType.propertyTypeId === eachUnitDto.propertyTypeId) === -1);
                yield this.dbManager.transaction((transactionManager) => __awaiter(this, void 0, void 0, function* () {
                    var _a, e_1, _b, _c, _d, e_2, _e, _f, _g, e_3, _h, _j;
                    try {
                        // remove associated property unit types that have been removed.
                        for (var _k = true, propertyUnitsToRemove_1 = __asyncValues(propertyUnitsToRemove), propertyUnitsToRemove_1_1; propertyUnitsToRemove_1_1 = yield propertyUnitsToRemove_1.next(), _a = propertyUnitsToRemove_1_1.done, !_a; _k = true) {
                            _c = propertyUnitsToRemove_1_1.value;
                            _k = false;
                            const eachPropertyUnitToRemove = _c;
                            yield this.dbManager.delete(PropertySubscriptionUnit_entity_1.PropertySubscriptionUnit, {
                                entiySubscriberPropertyId: eachPropertyUnitToRemove.entiySubscriberPropertyId,
                                propertySubscriptionId: eachPropertyUnitToRemove.propertySubscriptionId,
                            });
                            yield this.dbManager.delete(entitySubscriberProperty_entity_1.EntitySubscriberProperty, {
                                id: eachPropertyUnitToRemove.entitySubscriberProperty.id,
                            });
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (!_k && !_a && (_b = propertyUnitsToRemove_1.return)) yield _b.call(propertyUnitsToRemove_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    try {
                        // update the property unit for existing property unit type
                        for (var _l = true, exitingPropertyUnitTypes_1 = __asyncValues(exitingPropertyUnitTypes), exitingPropertyUnitTypes_1_1; exitingPropertyUnitTypes_1_1 = yield exitingPropertyUnitTypes_1.next(), _d = exitingPropertyUnitTypes_1_1.done, !_d; _l = true) {
                            _f = exitingPropertyUnitTypes_1_1.value;
                            _l = false;
                            const prorpertytype = _f;
                            const propertyUnit = existingPropertyUnitsAndType.find((eachUnit) => eachUnit.entitySubscriberProperty.propertyType.name.toLocaleLowerCase() ===
                                prorpertytype.propertyType.toLocaleLowerCase());
                            if (propertyUnit) {
                                propertyUnit.propertyUnits = Number(prorpertytype.propertyUnit);
                                yield this.dbManager.save(propertyUnit);
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (!_l && !_d && (_e = exitingPropertyUnitTypes_1.return)) yield _e.call(exitingPropertyUnitTypes_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    try {
                        for (var _m = true, newPropertyUnitsTypes_1 = __asyncValues(newPropertyUnitsTypes), newPropertyUnitsTypes_1_1; newPropertyUnitsTypes_1_1 = yield newPropertyUnitsTypes_1.next(), _g = newPropertyUnitsTypes_1_1.done, !_g; _m = true) {
                            _j = newPropertyUnitsTypes_1_1.value;
                            _m = false;
                            const propertyType = _j;
                            // add new property units
                            // const newPropertyUnitType =
                            //   propertyUnitsDetails.propertySubscriptionUnits.find(
                            //     (eachUnitDto) =>
                            //       eachUnitDto.propertyType === propertyType.propertyType,
                            //   );
                            // if (newPropertyUnitType) {
                            //   newPropertyUnitsTypes.push(newPropertyUnitType);
                            // }
                            // create a new proeperty type
                            let referencedPropertyType = yield this.dbManager.findOne(propertyTypes_entity_1.PropertyType, {
                                where: { id: propertyType.propertyTypeId },
                            });
                            if (!referencedPropertyType) {
                                referencedPropertyType = transactionManager.create(propertyTypes_entity_1.PropertyType, {
                                    name: propertyType.propertyType,
                                    unitPrice: propertyType.unitPrice,
                                    entityProfileId,
                                });
                                referencedPropertyType = yield transactionManager.save(referencedPropertyType);
                            }
                            // create entity subscriber property
                            let entitySubscriberProperty = transactionManager.create(entitySubscriberProperty_entity_1.EntitySubscriberProperty, {
                                ownerEntitySubscriberProfileId: propertySubscription.entitySubscriberProfileId,
                                propertyTypeId: referencedPropertyType.id,
                            });
                            entitySubscriberProperty = yield transactionManager.save(entitySubscriberProperty);
                            // create the entity subscription property unit
                            const propertySubscriptionUnit = transactionManager.create(PropertySubscriptionUnit_entity_1.PropertySubscriptionUnit, {
                                propertySubscriptionId: propertySubscription.id,
                                entiySubscriberPropertyId: entitySubscriberProperty.id,
                                propertyUnits: Number(propertyType.propertyUnit),
                            });
                            yield transactionManager.save(propertySubscriptionUnit);
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (!_m && !_g && (_h = newPropertyUnitsTypes_1.return)) yield _h.call(newPropertyUnitsTypes_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                }));
            });
        }
        // async getPropertyTypes({ entityProfileId, queryTerm }:{entityProfileId: string, queryTerm: string}) {
        //   const propertyTypes = await this.dbManager.find(PropertyType, {
        //     where: {
        //       ...(queryTerm ? { name: ILike(`%${queryTerm}%`)} : {}),
        //       { entityProfileId}
        //     }
        //   })
        // }
        getBillingDetailsOrDefaulters(entityProfileId, { streetId, billingMonth, billingYear = new Date().getFullYear(), propertySubscriptionId, }) {
            return __awaiter(this, void 0, void 0, function* () {
                //
                const street = yield this.getStreetOrThrowError({
                    streetId,
                    entityProfileId,
                    throwError: true,
                });
                // TODO: validate billing month
                let billingDetails = [];
                if (!billingMonth) {
                    const propertySubscriptions = yield this.dbManager.find(propertySubscription_entity_1.PropertySubscription, {
                        where: {
                            streetId,
                            billingAccount: {
                                totalBillings: (0, typeorm_1.Raw)(() => `"totalBillings" - "totalPayments" > '0' :: numeric`),
                            },
                        },
                        relations: {
                            billings: true,
                            billingAccount: true,
                        },
                    });
                    billingDetails = propertySubscriptions.map((propertySubscription) => {
                        var _a, _b, _c, _d;
                        let arrears = (0, mathjs_1.bignumber)(propertySubscription.billingAccount.totalBillings)
                            .sub(propertySubscription.billingAccount.totalPayments)
                            .toNumber();
                        arrears = arrears >= 0 ? arrears : 0;
                        return {
                            streetName: street.name,
                            PropertySubscriptionId: propertySubscription.id,
                            propertyName: propertySubscription.propertySubscriptionName,
                            currentBilling: ((_b = (_a = propertySubscription.billings) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.amount) || '0',
                            currentBillingId: ((_d = (_c = propertySubscription.billings) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.id) || '0',
                            arrears,
                        };
                    });
                }
                else {
                    billingDetails = yield this.dbManager
                        .createQueryBuilder(propertySubscription_entity_1.PropertySubscription, 'propertySubscription')
                        .select((qb) => {
                        return qb
                            .from(street_entity_1.Street, 'street')
                            .select('street.name', 'streetName')
                            .where('street.id = :streetId', { streetId });
                    }, 'streetName')
                        .addSelect('propertySubscription.streetNumber', 'streetNumber')
                        .addSelect('propertySubscription.id', 'propertySubscriptionId')
                        .addSelect('propertySubscription.propertySubscriptionName', 'propertyName')
                        .addSelect((qb) => qb
                        .from(billingAccount_entity_1.BillingAccount, 'billingAccount')
                        .select(`case when "billingAccount"."totalBillings" :: numeric - "billingAccount"."totalPayments" :: numeric - coalesce((
                    ${this.dbManager
                        .createQueryBuilder(billing_entity_1.Billing, 'billing')
                        .select('billing.amount', 'amount')
                        .where(`billing.month = :billingMonth`)
                        .andWhere(`billing.year = '${billingYear}'`, {
                        billingMonth,
                    })
                        .andWhere('billing.propertySubscriptionId = "propertySubscription"."id"')
                        .getQuery()}
                  ) :: numeric, 0) > 0
                  then "billingAccount"."totalBillings" :: numeric - "billingAccount"."totalPayments" :: numeric - coalesce((
                    ${this.dbManager
                        .createQueryBuilder(billing_entity_1.Billing, 'billing')
                        .select('billing.amount', 'amount')
                        .where(`billing.month = :billingMonth`)
                        .andWhere(`billing.year = '${billingYear}'`, {
                        billingMonth,
                    })
                        .andWhere('billing.propertySubscriptionId = "propertySubscription"."id"')
                        .getQuery()}
                  ) :: numeric, 0)
                  else 0
                  end
                  `, 'arrears')
                        .where(`billingAccount.propertySubscriptionId = "propertySubscription"."id"`), 'arrears')
                        .addSelect((qb) => qb
                        .from(billing_entity_1.Billing, 'billing')
                        .select('billing.amount', 'amount')
                        .where(`billing.month = :billingMonth`)
                        .andWhere(`billing.year = '${billingYear}'`, { billingMonth })
                        .andWhere('billing.propertySubscriptionId = "propertySubscription"."id"'), 'currentBilling')
                        .addSelect((qb) => qb
                        .from(billing_entity_1.Billing, 'billing')
                        .select('billing.id', 'id')
                        .where(`billing.month = :billingMonth`)
                        .andWhere(`billing.year = '${billingYear}'`, { billingMonth })
                        .andWhere('billing.propertySubscriptionId = "propertySubscription"."id"'), 'currentBillingId')
                        .addSelect((qb) => qb
                        .from(billingAccount_entity_1.BillingAccount, 'billingAccount')
                        .select(`case when "billingAccount"."totalBillings" - "billingAccount"."totalPayments" < 0 
                    then 0
                    else "billingAccount"."totalBillings" - "billingAccount"."totalPayments"
                    end
                    `, 'totalBilling')
                        .where(`billingAccount.propertySubscriptionId = "propertySubscription"."id"`), 'totalBilling')
                        .addSelect((qb) => {
                        return qb
                            .from(PropertySubscriptionUnit_entity_1.PropertySubscriptionUnit, 'propertySubscriptionUnit')
                            .select(`json_agg(json_build_object(
                'propertyUnits', "propertySubscriptionUnit"."propertyUnits",
                'propertyType', (select "subQuery"."propertyTypeName" from (${this.dbManager
                            .createQueryBuilder(entitySubscriberProperty_entity_1.EntitySubscriberProperty, 'entitySubscriberProperty')
                            .select((qb) => qb
                            .from(propertyTypes_entity_1.PropertyType, 'propertyType')
                            .select('propertyType.name', 'propertyTypeName')
                            .where('propertyType.id = "entitySubscriberProperty"."propertyTypeId"'), 'propertyTypeName')
                            .where('entitySubscriberProperty.id = "propertySubscriptionUnit"."entiySubscriberPropertyId"')
                            .getSql()}) as "subQuery"),
              'propertyTypeUnitPrice', (select "subQuery"."unitPrice" from (${this.dbManager
                            .createQueryBuilder(entitySubscriberProperty_entity_1.EntitySubscriberProperty, 'entitySubscriberProperty')
                            .select((qb) => qb
                            .from(propertyTypes_entity_1.PropertyType, 'propertyType')
                            .select('propertyType.unitPrice', 'unitPrice')
                            .where('propertyType.id = "entitySubscriberProperty"."propertyTypeId"'), 'unitPrice')
                            .where('entitySubscriberProperty.id = "propertySubscriptionUnit"."entiySubscriberPropertyId"')
                            .getSql()}) as "subQuery")
              ))
              `, 'propertyUnits')
                            .where('propertySubscriptionUnit.propertySubscriptionId = "propertySubscription"."id"');
                    }, 'propertyUnits')
                        .addSelect((qb) => qb
                        .from(payments_entity_1.Payment, 'payment')
                        .select('payment.amount')
                        .where('payment.propertySubscriptionId = "propertySubscription"."id"')
                        .orderBy('payment.createdAt', 'DESC')
                        .limit(1), 'lastPayment')
                        .where(`${'propertySubscription.streetId = :streetId'} ${!!propertySubscriptionId !== false ? 'and propertySubscription.id = :propertySubscriptionId' : ''}`, Object.assign({ streetId,
                        billingMonth }, (!!propertySubscriptionId !== false ? { propertySubscriptionId } : {})))
                        .getRawMany();
                }
                return billingDetails
                    .filter((billing) => !!billing.currentBillingId)
                    .map((result) => {
                    result['currentBilling'] = result['currentBilling'] || '0';
                    return (0, lodash_1.pick)(result, [
                        'streetName',
                        'propertySubscriptionId',
                        'propertyName',
                        'arrears',
                        'currentBilling',
                        'currentBillingId',
                        'totalBilling',
                        'lastPayment',
                        'propertyUnits',
                        'streetNumber',
                    ]);
                });
            });
        }
        getDashboardMetrics(entityProfileId) {
            return __awaiter(this, void 0, void 0, function* () {
                // get number of streets
                // get number of subscribers
                // get number of properties
                const dashboardMetrics = {
                    streetCount: 0,
                    subscriberCount: 0,
                    properitesCount: 0,
                    totalBillings: 0,
                    totalPayments: 0,
                    billingAcrossMonths: [],
                    paymentsAcrossMonths: [],
                };
                try {
                    dashboardMetrics.streetCount = yield this.dbManager.count(street_entity_1.Street, {
                        where: {
                            entityProfileId,
                        },
                    });
                }
                catch (err) {
                    common_1.Logger.log('An error occured while calculating street count', err);
                }
                try {
                    dashboardMetrics.subscriberCount = yield this.dbManager.count(propertySubscription_entity_1.PropertySubscription, {
                        where: {
                            entityProfileId,
                        },
                    });
                }
                catch (err) {
                    common_1.Logger.log('An error occured while calculating subscriber count', err);
                }
                try {
                    dashboardMetrics.properitesCount = yield this.dbManager.count(PropertySubscriptionUnit_entity_1.PropertySubscriptionUnit, {
                        where: {
                            propertySubscription: {
                                entityProfileId,
                            },
                        },
                    });
                }
                catch (err) {
                    common_1.Logger.log('An error occured while calculating properites count', err);
                }
                // get total billings
                // get total payments
                const month = projectConstants_1.MonthNames[new Date().getMonth() + 1];
                try {
                    const billingAcrossMonths = yield this.dbManager.find(billing_entity_1.Billing, {
                        where: {
                            propertySubscription: {
                                entityProfileId,
                            },
                            year: new Date().getFullYear().toString(),
                        },
                    });
                    dashboardMetrics.totalBillings = billingAcrossMonths.reduce((acc, curr) => {
                        dashboardMetrics.billingAcrossMonths.push({
                            month: curr.month,
                            amount: curr.amount,
                        });
                        return (0, mathjs_1.bignumber)(acc).add(curr.amount).toNumber();
                    }, 0);
                }
                catch (err) {
                    common_1.Logger.log('An error occured while calculating total billings', err);
                }
                try {
                    const paymentsAcrossMonths = yield this.dbManager.find(payments_entity_1.Payment, {
                        where: {
                            propertySubscription: {
                                entityProfileId,
                            },
                            createdAt: (0, typeorm_1.Raw)(($alias) => `extract(month from ${$alias}) = :month`, {
                                month: this.getMonthNumber(month),
                            }),
                        },
                    });
                    dashboardMetrics.totalPayments = paymentsAcrossMonths.reduce((acc, curr) => {
                        dashboardMetrics.paymentsAcrossMonths.push({
                            month: this.getMonthName(new Date().getMonth() + 1),
                            amount: curr.amount,
                        });
                        return (0, mathjs_1.bignumber)(acc).add(curr.amount).toNumber();
                    }, 0);
                }
                catch (err) {
                    common_1.Logger.log('An error occured while calculating total payments', err);
                }
                return dashboardMetrics;
            });
        }
        postPayment(postPaymentDto, entityProfileId) {
            return __awaiter(this, void 0, void 0, function* () {
                //
                const propertySubscription = yield this.dbManager.findOne(propertySubscription_entity_1.PropertySubscription, {
                    where: {
                        id: postPaymentDto.propertySubscriptionId,
                        entityProfileId,
                    },
                    relations: {
                        billingAccount: true,
                    },
                });
                if (!propertySubscription) {
                    (0, helpers_1.throwBadRequest)('Property subscription not found.');
                }
                const billingAccount = propertySubscription.billingAccount;
                const totalPayments = (0, mathjs_1.bignumber)(billingAccount.totalPayments)
                    .add(postPaymentDto.amount)
                    .toNumber();
                billingAccount.totalPayments = String(totalPayments);
                yield this.dbManager.transaction((transactionManager) => __awaiter(this, void 0, void 0, function* () {
                    const payment = transactionManager.create(payments_entity_1.Payment, Object.assign({}, postPaymentDto));
                    yield transactionManager.save(payment);
                    yield transactionManager.save(billingAccount);
                }));
            });
        }
        getMonthNumber(monthName) {
            const monthNumber = Object.values(projectConstants_1.MonthNames).indexOf(monthName) + 1;
            return monthNumber;
        }
        getPayments({ propertySubscriptionId, entityProfileId, year = new Date().getFullYear().toString(), month, }) {
            return __awaiter(this, void 0, void 0, function* () {
                //
                let payments = [];
                if (month && year) {
                    payments = yield this.dbManager.find(payments_entity_1.Payment, {
                        where: Object.assign(Object.assign({}, (propertySubscriptionId ? { propertySubscriptionId } : {})), { paymentDate: (0, typeorm_1.Raw)(($alias) => `extract(month from ${$alias}) = :month`, {
                                month: this.getMonthNumber(month),
                            }), propertySubscription: {
                                entityProfileId: entityProfileId,
                            } }),
                        relations: {
                            propertySubscription: true,
                        },
                    });
                }
                else {
                    payments = yield this.dbManager.find(payments_entity_1.Payment, {
                        where: Object.assign({ propertySubscriptionId: propertySubscriptionId, propertySubscription: {
                                entityProfileId: entityProfileId,
                            } }, (year ? { year } : {})),
                        relations: {
                            propertySubscription: true,
                        },
                    });
                }
                return payments.map((payment) => ({
                    id: payment.id,
                    amount: payment.amount,
                    paymentDate: payment.paymentDate,
                    propertySubscriptionId: payment.propertySubscriptionId,
                    payerName: payment.payerName,
                    year: new Date(payment.paymentDate).getFullYear().toString(),
                    month: projectConstants_1.MonthNames[new Date(payment.paymentDate).getMonth() + 1],
                    propertySubscriptionName: payment.propertySubscription.propertySubscriptionName,
                }));
            });
        }
        createStreet(createStreetDto, authPayload) {
            return __awaiter(this, void 0, void 0, function* () {
                const entityProfileId = authPayload.profile.entityProfileId;
                const lgaWardId = createStreetDto.lgaWardId;
                // check if street with name already exists
                let street = yield this.dbManager.findOne(street_entity_1.Street, {
                    where: {
                        name: (0, typeorm_1.ILike)(`%${createStreetDto.name}%`),
                        lgaWardId,
                        entityProfileId,
                    },
                });
                if (!street) {
                    // street does not exist, create new street
                    // verify lgaWard and lga exist
                    yield this.getLgaWardOrThrowError({
                        lgaWardId,
                    });
                    street = this.dbManager.create(street_entity_1.Street, {
                        name: createStreetDto.name,
                        lgaWardId,
                        entityProfileId,
                    });
                    yield this.dbManager.save(street);
                }
                return street;
            });
        }
        createLgaWard(createLgaWardDto) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.getLgaOrThrowError({ lgaId: createLgaWardDto.lgaId });
                const lgaId = createLgaWardDto.lgaId;
                // verify lgaWard does not already exist
                let lgaWard = yield this.getLgaWardOrThrowError({
                    name: (0, typeorm_1.ILike)(`%${createLgaWardDto.name}%`),
                    throwError: false,
                });
                if (!lgaWard) {
                    lgaWard = this.dbManager.create(lgaWard_entity_1.LgaWard, {
                        name: createLgaWardDto.name,
                        lgaId,
                    });
                    lgaWard = yield this.dbManager.save(lgaWard);
                }
                return lgaWard;
            });
        }
        createLga(createLgaDto) {
            return __awaiter(this, void 0, void 0, function* () {
                // verify lga does not exist
                let lga = yield this.getLgaOrThrowError({
                    name: (0, typeorm_1.ILike)(`%${createLgaDto.name}%`),
                    throwError: false,
                });
                if (!lga) {
                    lga = this.dbManager.create(lga_entity_1.Lga, {
                        name: createLgaDto.name,
                    });
                    yield this.dbManager.save(lga);
                }
                return lga;
            });
        }
        getLgas(query) {
            return __awaiter(this, void 0, void 0, function* () {
                const lgas = query
                    ? yield this.dbManager.find(lga_entity_1.Lga, {
                        where: {
                            name: (0, typeorm_1.ILike)(`%${query}%`),
                        },
                    })
                    : yield this.dbManager.find(lga_entity_1.Lga);
                return lgas;
            });
        }
        getLgaWards({ query, lgaId }) {
            return __awaiter(this, void 0, void 0, function* () {
                const lgaWards = query || lgaId
                    ? yield this.dbManager.find(lgaWard_entity_1.LgaWard, {
                        where: Object.assign(Object.assign({}, (query ? { name: (0, typeorm_1.ILike)(`%${query}%`) } : {})), (lgaId ? { lgaId } : {})),
                    })
                    : yield this.dbManager.find(lgaWard_entity_1.LgaWard);
                return lgaWards;
            });
        }
        getStreets(entityProfileId, { query, lgaWardId }) {
            return __awaiter(this, void 0, void 0, function* () {
                const streets = query || lgaWardId
                    ? yield this.dbManager.find(street_entity_1.Street, {
                        where: Object.assign(Object.assign(Object.assign({}, (query ? { name: (0, typeorm_1.ILike)(`%${query}%`) } : {})), (lgaWardId ? { lgaWardId } : {})), { entityProfileId }),
                    })
                    : yield this.dbManager.find(street_entity_1.Street, {
                        where: {
                            entityProfileId,
                        },
                    });
                return streets;
            });
        }
        getPhoneCode({ query, phoneCodeId, } = {}) {
            return __awaiter(this, void 0, void 0, function* () {
                if (phoneCodeId) {
                    const phoneCode = yield this.dbManager.findOne(phoneCode_entity_1.PhoneCode, {
                        where: { id: phoneCodeId },
                    });
                    return phoneCode;
                }
                const phoneCodes = query
                    ? yield this.dbManager.find(phoneCode_entity_1.PhoneCode, {
                        where: {
                            name: (0, typeorm_1.ILike)(`%${query}%`),
                        },
                    })
                    : yield this.dbManager.find(phoneCode_entity_1.PhoneCode);
                return phoneCodes;
            });
        }
        //
        getPhoneCodeOrThrow({ phoneCodeId, name, throwError = true, } = {}) {
            return __awaiter(this, void 0, void 0, function* () {
                const phoneCode = yield this.dbManager.findOne(phoneCode_entity_1.PhoneCode, {
                    where: Object.assign({}, (phoneCodeId ? { id: phoneCodeId } : { name: (0, typeorm_1.ILike)(`%${name}%`) })),
                });
                throwError = !phoneCode && throwError;
                if (throwError) {
                    (0, helpers_1.throwBadRequest)('Phone code not found.');
                }
                return phoneCode;
            });
        }
        getLgaWardOrThrowError({ name, lgaWardId, throwError = true, }) {
            return __awaiter(this, void 0, void 0, function* () {
                const lgaWard = yield this.dbManager.findOne(lgaWard_entity_1.LgaWard, {
                    where: Object.assign({}, (name ? { name } : { id: lgaWardId })),
                });
                throwError = !lgaWard && throwError;
                if (throwError) {
                    (0, helpers_1.throwBadRequest)('Lga ward not found.');
                }
                return lgaWard;
            });
        }
        getLgaOrThrowError({ name, lgaId, throwError = true, }) {
            return __awaiter(this, void 0, void 0, function* () {
                const lga = yield this.dbManager.findOne(lga_entity_1.Lga, {
                    where: Object.assign({}, (name ? { name } : { id: lgaId })),
                });
                throwError = !lga && throwError;
                if (throwError) {
                    (0, helpers_1.throwBadRequest)('Lga not found.');
                }
                return lga;
            });
        }
        getMonthName(month) {
            if (!month) {
                month = new Date().getMonth() + 1;
            }
            return projectConstants_1.MonthNames[month];
        }
        validateEntitySubscriberProfileById(propertySubscriberProfileId) {
            return __awaiter(this, void 0, void 0, function* () {
                const propertySubscriberProfile = yield this.dbManager.findOne(entitySubscriberProfile_entity_1.EntitySubscriberProfile, {
                    where: {
                        id: propertySubscriberProfileId,
                    },
                });
                if (!propertySubscriberProfile) {
                    (0, helpers_1.throwBadRequest)('Reference to subscriber is invalid.');
                }
                return !!propertySubscriberProfile;
            });
        }
        getPropertyTypeOrThrowError({ name, propertyTypeId, unitPrice, throwError = true, }) {
            return __awaiter(this, void 0, void 0, function* () {
                const propertyType = yield this.dbManager.findOne(propertyTypes_entity_1.PropertyType, {
                    where: Object.assign({}, (name ? { name, unitPrice } : { id: propertyTypeId })),
                });
                throwError = !propertyType && throwError;
                if (throwError) {
                    (0, helpers_1.throwBadRequest)('Reference to property type is invalid.');
                }
                return propertyType;
            });
        }
        getStreetOrThrowError({ name, streetId, entityProfileId, throwError = true, }) {
            return __awaiter(this, void 0, void 0, function* () {
                const street = yield this.dbManager.findOne(street_entity_1.Street, {
                    where: Object.assign(Object.assign({}, (name ? { name } : { id: streetId })), (entityProfileId ? { entityProfileId } : {})),
                });
                throwError = !street && throwError;
                if (throwError) {
                    (0, helpers_1.throwBadRequest)('Reference to street is invalid.');
                }
                return street;
            });
        }
    };
    __setFunctionName(_classThis, "UtilsBillingService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UtilsBillingService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UtilsBillingService = _classThis;
})();
exports.UtilsBillingService = UtilsBillingService;
