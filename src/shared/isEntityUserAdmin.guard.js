"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsEntityUserAdmin = void 0;
class IsEntityUserAdmin {
    constructor() {
        //
    }
    canActivate(context) {
        return this.checkEntityUserAdmin(context);
    }
    checkEntityUserAdmin(context) {
        var _a, _b;
        const req = context.switchToHttp().getRequest();
        const authPayload = req.authPayload;
        if (!authPayload) {
            return false;
        }
        const userIsEntityAdmin = (_a = authPayload.profile) === null || _a === void 0 ? void 0 : _a.entityProfileId;
        return !!userIsEntityAdmin && !!((_b = authPayload.userData) === null || _b === void 0 ? void 0 : _b.id);
    }
}
exports.IsEntityUserAdmin = IsEntityUserAdmin;
