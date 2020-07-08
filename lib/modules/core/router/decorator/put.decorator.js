"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Put = void 0;
const request_method_enum_1 = require("../enum/request-method.enum");
const route_decorator_1 = require("./route.decorator");
const authorization_enum_1 = require("../../auth/enum/authorization.enum");
function Put(path, authorization = authorization_enum_1.Authorization.ROUTE) {
    return function (target, key, descriptor) {
        route_decorator_1.Route(path, authorization, request_method_enum_1.RequestMethod.PUT)(target, key, descriptor);
    };
}
exports.Put = Put;
//# sourceMappingURL=put.decorator.js.map