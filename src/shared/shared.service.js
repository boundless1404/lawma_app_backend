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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedService = void 0;
const common_1 = require("@nestjs/common");
const mail_1 = __importDefault(require("@sendgrid/mail"));
const bcrypt_1 = require("bcrypt");
// import * as twilio from 'twilio';
const sib_api_v3_sdk_1 = require("sib-api-v3-sdk");
const axios_1 = __importDefault(require("axios"));
let SharedService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SharedService = _classThis = class {
        constructor(config, jwtService) {
            this.config = config;
            this.jwtService = jwtService;
            //
        }
        hashPassword(data) {
            return __awaiter(this, void 0, void 0, function* () {
                const saltRounds = Number(this.config.get('HASH_SALT_ROUNDS') || 10);
                const hashedPassword = yield (0, bcrypt_1.hash)(data, saltRounds);
                return hashedPassword;
            });
        }
        veryfyJwtToken(token) {
            return __awaiter(this, void 0, void 0, function* () {
                const payload = yield this.jwtService.verify(token, {
                    secret: this.config.get('JWT_SECRET'),
                });
                return payload;
            });
        }
        signPayload(payload) {
            const stringifiedPayload = typeof payload === 'string' ? payload : JSON.stringify(payload);
            const token = this.jwtService.sign(stringifiedPayload, {
                secret: this.config.get('JWT_SECRET'),
            });
            return token;
        }
        comparePassword(password, hashedPassword) {
            return __awaiter(this, void 0, void 0, function* () {
                // hash password and compare with the one in the database
                const isPasswordCorrect = yield (0, bcrypt_1.compare)(password, hashedPassword);
                return isPasswordCorrect;
            });
        }
        sendMail(options, substitutionWrappers = ['{{', '}}']) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    let mailBodyIsMultiple;
                    if (Array.isArray(options))
                        mailBodyIsMultiple = true;
                    mail_1.default.setSubstitutionWrappers(...substitutionWrappers);
                    const mailApiKey = this.config.get('MAIL_API_KEY');
                    mail_1.default.setApiKey(mailApiKey);
                    const mailResponse = yield mail_1.default.send(options, mailBodyIsMultiple);
                    return mailResponse;
                }
                catch (error) {
                    common_1.Logger.error(error, 'emailService');
                    return undefined;
                }
            });
        }
        // async isTokenExpired(expiry: number, createdAt: Date) {
        //   const currentTime = Date.now();
        //   const timeDifference = currentTime - createdAt.getTime();
        //   const expiryTime = expiry * 60 * 60 * 1000; // convert hours to milliseconds
        //   if (timeDifference > expiryTime) {
        //     return true;
        //   }
        //   return false;
        // }
        isTokenExpired(createdAt, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const expiry = options.expiresInSeconds || options.expiresInHHours;
                const tokenExpirtyFactor = 1000 * 60 * options.expiresInHHours ? 60 : 1;
                const currentTime = Date.now();
                const timeDifferenceInMilliseconds = currentTime - createdAt.getTime();
                const expiryTime = expiry * tokenExpirtyFactor; // convert hours to milliseconds
                if (timeDifferenceInMilliseconds > expiryTime) {
                    return true;
                }
                return false;
            });
        }
        // * Implement sending sms with twilio
        sendSms(sms) {
            return __awaiter(this, void 0, void 0, function* () {
                //
                //Get account SID and auth token from environment variables
                const accountSid = process.env.TWILIO_ACCOUNT_SID;
                const authToken = process.env.TWILIO_AUTH_TOKEN;
                const sender = process.env.TWILIO_PHONE_NUMBER;
                // try {
                //   const message = await client.messages.create({
                //     body: sms.message,
                //     from: `+1${sms.from}`,
                //     to: `+1${sms.to}`
                //   });
                //   console.log(message.sid);
                // } catch (error) {
                //   console.log(error);
                // }
            });
        }
        sendSmsWithMtonApi(options) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    // Ensure that the receiverAddress field is not empty
                    if (!options.receiverAddress || options.receiverAddress.length === 0) {
                        throw new Error('Receiver address is required');
                    }
                    // Ensure that the message and clientCorrelatorId fields are not longer than their respective maximum lengths
                    if (options.message.length > 160) {
                        throw new Error('Message cannot be longer than 160 characters');
                    }
                    if (options.clientCorrelatorId.length > 36) {
                        throw new Error('Client correlator ID cannot be longer than 36 characters');
                    }
                    // Ensure that the serviceCode field is not empty
                    if (!options.serviceCode) {
                        throw new Error('Service code is required');
                    }
                    const response = yield (0, axios_1.default)({
                        method: 'POST',
                        url: 'https://api.mtn.com/v3/sms/messages/sms/outbound',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: '',
                        },
                        data: options,
                    });
                    if (response.data) {
                        return response.data;
                    }
                    else {
                        return undefined;
                    }
                }
                catch (error) {
                    common_1.Logger.error(error, 'SMSService');
                    return undefined;
                }
            });
        }
        registerCallbackUrl(options) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield axios_1.default.post('https://api.mtn.com/v3/sms/messages/sms/subscription', {
                        callbackUrl: options.callbackUrl,
                        targetSystem: options.targetSystem,
                        deliveryReportUrl: options.deliveryReportUrl,
                        serviceCode: options.serviceCode,
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            transactionId: '',
                            Authorization: '',
                        },
                    });
                    return response.data;
                }
                catch (error) {
                    throw new Error(`Failed to register callback URL: ${error.message}`);
                }
            });
        }
        sendBrevoEmail(sendSmtpEmail) {
            return __awaiter(this, void 0, void 0, function* () {
                const brevoApiKey = this.config.get('BREVO_API_KEY');
                // const brevoApiUrl = 'https://api.brevo.com/v1';
                const defaultClient = sib_api_v3_sdk_1.SibApiV3Sdk.ApiClient.instance;
                // Configure API key authorization: api-key
                const apiKey = defaultClient.authentications['api-key'];
                apiKey.apiKey = brevoApiKey;
                // Configure API key authorization: partner-key
                const partnerKey = defaultClient.authentications['partner-key'];
                partnerKey.apiKey = brevoApiKey;
                const apiInstance = new sib_api_v3_sdk_1.SibApiV3Sdk.TransactionalEmailsApi();
                try {
                    const data = yield apiInstance.sendTransacEmail(sendSmtpEmail);
                    return data;
                }
                catch (error) {
                    console.error(error);
                }
            });
        }
        sendBrevoBactchedEmail(email, templateId) {
            return __awaiter(this, void 0, void 0, function* () {
                const brevoApiKey = this.config.get('BREVO_API_KEY');
                // const brevoApiUrl = 'https://api.brevo.com/v1';
                const defaultClient = sib_api_v3_sdk_1.SibApiV3Sdk.ApiClient.instance;
                // Configure API key authorization: api-key
                const apiKey = defaultClient.authentications['api-key'];
                apiKey.apiKey = brevoApiKey;
                // Configure API key authorization: partner-key
                const partnerKey = defaultClient.authentications['partner-key'];
                partnerKey.apiKey = brevoApiKey;
                const apiInstance = new sib_api_v3_sdk_1.SibApiV3Sdk.TransactionalEmailsApi();
                const batchSend = new sib_api_v3_sdk_1.SibApiV3Sdk.SendSmtpEmail();
                batchSend.to = [{ email: email }];
                batchSend.templateId = templateId;
                batchSend.sender = { name: 'Sender Name', email: 'ender@example.com' };
                batchSend.subject = 'Test email';
                batchSend.params = {
                    // Add your template variables here
                    variable1: 'value1',
                    variable2: 'value2',
                };
                try {
                    const data = yield apiInstance.sendTransacEmail(batchSend);
                    console.log('API call successful. Returned data: ', JSON.stringify(data));
                }
                catch (error) {
                    console.error(error);
                }
            });
        }
        removeUnwantedFields(data, fields) {
            const dataCopy = Object.assign({}, data);
            fields.forEach((field) => {
                delete dataCopy[field];
            });
            return dataCopy;
        }
    };
    __setFunctionName(_classThis, "SharedService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SharedService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SharedService = _classThis;
})();
exports.SharedService = SharedService;
