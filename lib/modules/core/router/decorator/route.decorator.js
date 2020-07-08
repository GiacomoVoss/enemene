"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const authorization_enum_1 = require("../../auth/enum/authorization.enum");
function Route(path, authorization = authorization_enum_1.Authorization.ROUTE, requestMethod) {
    return function (target, key, descriptor) {
        var _a;
        const paths = target.constructor.prototype.$paths || [];
        const parameters = target.constructor.prototype.$parameters || {};
        paths.push({
            method: requestMethod,
            path,
            fn: descriptor.value,
            parameters: (_a = parameters[key]) !== null && _a !== void 0 ? _a : [],
            authorization,
        });
        target.constructor.prototype.$paths = paths;
    };
}
exports.Route = Route;
//# sourceMappingURL=route.decorator.js.map