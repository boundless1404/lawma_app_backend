"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsAuthenticated = void 0;
class IsAuthenticated {
    constructor() {
        //
    }
    canActivate(context) {
        return this.checkUserAccess(context);
    }
    checkUserAccess(context) {
        const userData = this.getContextData(context, 'userData');
        const isAuthenticated = !!userData && !!userData.id;
        return isAuthenticated;
    }
    getContextData(context, dataProp) {
        const req = context.switchToHttp().getRequest();
        const authPayload = req.authPayload;
        const data = authPayload ? authPayload[dataProp] : undefined;
        return data;
    }
}
exports.IsAuthenticated = IsAuthenticated;
