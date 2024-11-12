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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const entityUserProfile_entity_1 = require("../utils-billing/entitties/entityUserProfile.entity");
const helpers_1 = require("../utils/helpers");
const entityProfile_entity_1 = require("../utils-billing/entitties/entityProfile.entity");
const lodash_1 = require("lodash");
const enums_1 = require("../lib/enums");
let AuthService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = _classThis = class {
        constructor(dbSource, helperService, requestService, sharedService, profileService) {
            this.dbSource = dbSource;
            this.helperService = helperService;
            this.requestService = requestService;
            this.sharedService = sharedService;
            this.profileService = profileService;
            //
            this.dbManager = this.dbSource.manager;
        }
        authenticateUserOnAuthServer(action, { signupDto, signinDto, }) {
            return __awaiter(this, void 0, void 0, function* () {
                const authServerRequestBody = Object.assign(Object.assign({}, signupDto), { initiateVerificationRequest: false });
                const authServerRequestPath = `/project/app/${action}`;
                const response = yield this.requestService.requestAuth(authServerRequestPath, {
                    body: action === 'signup' ? authServerRequestBody : Object.assign({}, signinDto),
                    method: 'POST',
                });
                let userData;
                if ([200, 201].includes(response.status)) {
                    userData = response.data;
                }
                else {
                    const actionError = {
                        signup: (0, helpers_1.throwForbidden)('User data is invalid'),
                        signin: (0, helpers_1.throwUnathorized)('Invalid credentials.'),
                    };
                    return actionError[action];
                }
                return userData;
            });
        }
        signup(signupDto) {
            return __awaiter(this, void 0, void 0, function* () {
                // do necessary checks
                // check that the email does not already exist.
                const existingEntityUserProfile = yield this.helperService.getEntityUserProfileByEmailOrId({
                    email: signupDto.email,
                });
                if (existingEntityUserProfile) {
                    (0, helpers_1.throwForbidden)('Email is already registered.');
                }
                const userData = yield this.authenticateUserOnAuthServer('signup', {
                    signupDto,
                });
                const entityProfileDto = signupDto.entityProfile;
                let authTokenPayload;
                yield this.dbManager.transaction((transactionManager) => __awaiter(this, void 0, void 0, function* () {
                    if (entityProfileDto) {
                        let entityProfile = transactionManager.create(entityProfile_entity_1.EntityProfile, entityProfileDto);
                        entityProfile = yield transactionManager.save(entityProfile);
                        // remove stale fields
                        delete signupDto.entityProfile;
                        delete signupDto.password;
                        let entityUserProfile = transactionManager.create(entityUserProfile_entity_1.EntityUserProfile, Object.assign(Object.assign({}, signupDto), { entityProfileId: entityProfile.id }));
                        entityUserProfile = yield transactionManager.save(entityUserProfile);
                        const existingProfileSummary = this.profileService.getProfileSummary(userData.id);
                        const profile = yield this.profileService.createProfile({
                            userId: String(userData.id),
                            profileType: enums_1.ProfileTypes.ENTITY_USER_PROFILE,
                            profileTypeId: entityUserProfile.id,
                            isAdmin: !existingProfileSummary,
                        }, { transactionManager });
                        authTokenPayload = yield this.generateAuthToken(userData, profile, entityProfile.id);
                    }
                    // TODO: implement else branch
                }));
                return authTokenPayload;
            });
        }
        signin(signinDto) {
            return __awaiter(this, void 0, void 0, function* () {
                //
                const userData = yield this.authenticateUserOnAuthServer('signin', {
                    signinDto,
                });
                const profileSummary = yield this.profileService.getProfileSummary(userData.id);
                let entityProfileId = undefined;
                if (profileSummary.profileType === enums_1.ProfileTypes.ENTITY_USER_PROFILE) {
                    const entityUserProfile = yield this.helperService.getEntityUserProfileByEmailOrId({
                        entityUserProfileId: profileSummary.profileTypeId,
                    });
                    entityProfileId = entityUserProfile.entityProfileId;
                }
                const authTokenPayload = this.generateAuthToken(userData, profileSummary, entityProfileId);
                return authTokenPayload;
            });
        }
        generateAuthToken(userData, profile, entityProfileId) {
            return __awaiter(this, void 0, void 0, function* () {
                const authPayload = {
                    userData: (0, lodash_1.omit)(userData, ['isVerified']),
                    profile: Object.assign({ id: profile.id, profileType: profile.profileType, profileTypeId: profile.profileTypeId }, (entityProfileId ? { entityProfileId: entityProfileId } : {})),
                };
                const token = this.sharedService.signPayload(authPayload);
                return {
                    token,
                };
            });
        }
    };
    __setFunctionName(_classThis, "AuthService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthService = _classThis;
})();
exports.AuthService = AuthService;
