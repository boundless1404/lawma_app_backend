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
exports.BackgroundJobs = void 0;
const common_1 = require("@nestjs/common");
const enums_1 = require("src/lib/enums");
const typeorm_1 = require("typeorm");
const email_entity_1 = require("./email.entity");
const axios_1 = __importDefault(require("axios"));
const schedule_1 = require("@nestjs/schedule");
let BackgroundJobs = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _dbSource_decorators;
    let _dbSource_initializers = [];
    let _sharedService_decorators;
    let _sharedService_initializers = [];
    let _sendMails_decorators;
    var BackgroundJobs = _classThis = class {
        constructor() {
            this.dbSource = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _dbSource_initializers, void 0));
            this.sharedService = __runInitializers(this, _sharedService_initializers, void 0);
        }
        sendMails() {
            var _a, e_1, _b, _c;
            var _d, _e;
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const dbManager = this.dbSource.manager;
                    const emailJob = (yield dbManager
                        .createQueryBuilder(email_entity_1.Email, 'email')
                        .select(`
            case when 
                    exists(select * from email where priority = '${enums_1.EmailPriority.IMMEDIATE}' and "email"."deletedAt" is null)
                then (select jsonb_agg(jsonb_build_object(
                    'id', "email"."id",
                    'emailOptions', "email"."emailOptions",
                    'attachmentFileUrls', "email"."attachmentFileUrls",
                    'priority', "email"."priority",
                    'sendAt', "email"."sendAt"
                )) from "email" "email" where "email"."priority" = '${enums_1.EmailPriority.IMMEDIATE}'
                    and "email"."deletedAt" is null
                    limit 50
                    )
                when exists(select * from email where priority = '${enums_1.EmailPriority.REGULAR}' and "email"."deletedAt" is null)
                then (select jsonb_agg(jsonb_build_object(
                    'id', "email"."id",
                    'emailOptions', "email"."emailOptions",
                    'attachmentFileUrls', "email"."attachmentFileUrls",
                    'priority', "email"."priority",
                    'sendAt', "email"."sendAt"
                )) 
                    from "email" "email" where "email"."priority" = '${enums_1.EmailPriority.REGULAR}'
                    and "email"."deletedAt" is null
                    limit 50)
                when 
                    exists(
                            select * from email where priority = '${enums_1.EmailPriority.DELAYED}' and "sendAt" is not null and now() >= "email"."sendAt"
                            and "email"."deletedAt" is null
                          )
                 then (select jsonb_agg(jsonb_build_object(
                        'id', "email"."id",
                        'emailOptions', "email"."emailOptions",
                        'attachmentFileUrls', "email"."attachmentFileUrls",
                        'priority', "email"."priority",
                        'sendAt', "email"."sendAt"
                    )) 
                    from "email" "email"
                    where "email"."priority" = '${enums_1.EmailPriority.DELAYED}' and "email"."sendAt" is not null and now() >= "email"."sendAt"
                    and "email"."deletedAt" is null
                    limit 50
                    )
                else '[]' :: jsonb
            end
            `, 'emails')
                        .where('email.deletedAt is null')
                        .getRawOne());
                    if (emailJob && ((_d = emailJob.emails) === null || _d === void 0 ? void 0 : _d.length)) {
                        // flatten emails to send
                        const emails = yield Promise.all(emailJob.emails.map((email) => __awaiter(this, void 0, void 0, function* () {
                            const fileAttachments = [];
                            if (email.attachmentFileUrls && email.attachmentFileUrls.length) {
                                yield Promise.all(email.attachmentFileUrls.map((fileAttachmentDetails) => __awaiter(this, void 0, void 0, function* () {
                                    const fileUrl = fileAttachmentDetails.url;
                                    // *fetch wih axios and convert to base 64
                                    const requestResponse = yield axios_1.default.get(fileUrl);
                                    if (requestResponse.status === 200) {
                                        const fileBase64 = Buffer.from(requestResponse.data).toString('base64');
                                        fileAttachments.push({
                                            content: fileBase64,
                                            type: fileAttachmentDetails.fileType,
                                            filename: fileAttachmentDetails.fileName,
                                            disposition: 'attachment',
                                            content_id: fileAttachmentDetails.fileName +
                                                '_' +
                                                fileAttachmentDetails.fileType,
                                        });
                                    }
                                })));
                            }
                            return Object.assign(Object.assign(Object.assign({}, email.emailOptions), { to: undefined, personalizations: [
                                    {
                                        to: email.emailOptions.to,
                                        custom_args: {
                                            emailId: email.id,
                                        },
                                    },
                                ] }), (fileAttachments.length > 0
                                ? { attachments: fileAttachments }
                                : {}));
                        })));
                        const emailResponses = (yield this.sharedService.sendMail(emails));
                        let index = 0;
                        const emailIdsToDelete = [];
                        try {
                            for (var _f = true, emailResponses_1 = __asyncValues(emailResponses), emailResponses_1_1; emailResponses_1_1 = yield emailResponses_1.next(), _a = emailResponses_1_1.done, !_a; _f = true) {
                                _c = emailResponses_1_1.value;
                                _f = false;
                                const response = _c;
                                const email = emailJob.emails[index];
                                /**
                                 ** Delete mail if sending succeeds
                                 */
                                if (((_e = response[0]) === null || _e === void 0 ? void 0 : _e.statusCode) === 202) {
                                    emailIdsToDelete.push(email.id);
                                }
                                index++;
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (!_f && !_a && (_b = emailResponses_1.return)) yield _b.call(emailResponses_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        if (emailIdsToDelete.length > 0) {
                            yield dbManager.softDelete(email_entity_1.Email, { id: (0, typeorm_1.In)(emailIdsToDelete) });
                        }
                    }
                    common_1.Logger.log('Email Job sender is exiting ...');
                }
                catch (error) {
                    common_1.Logger.log(error);
                }
            });
        }
    };
    __setFunctionName(_classThis, "BackgroundJobs");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _dbSource_decorators = [(0, common_1.Inject)(typeorm_1.DataSource)];
        _sharedService_decorators = [(0, common_1.Inject)()];
        _sendMails_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES)];
        __esDecorate(_classThis, null, _sendMails_decorators, { kind: "method", name: "sendMails", static: false, private: false, access: { has: obj => "sendMails" in obj, get: obj => obj.sendMails }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, null, _dbSource_decorators, { kind: "field", name: "dbSource", static: false, private: false, access: { has: obj => "dbSource" in obj, get: obj => obj.dbSource, set: (obj, value) => { obj.dbSource = value; } }, metadata: _metadata }, _dbSource_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _sharedService_decorators, { kind: "field", name: "sharedService", static: false, private: false, access: { has: obj => "sharedService" in obj, get: obj => obj.sharedService, set: (obj, value) => { obj.sharedService = value; } }, metadata: _metadata }, _sharedService_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BackgroundJobs = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BackgroundJobs = _classThis;
})();
exports.BackgroundJobs = BackgroundJobs;
