"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delete = void 0;
const request_method_enum_1 = require("../enum/request-method.enum");
const route_decorator_1 = require("./route.decorator");
const authorization_enum_1 = require("../../auth/enum/authorization.enum");
function Delete(path, authorization = authorization_enum_1.Authorization.ROUTE) {
    return function (target, key, descriptor) {
        route_decorator_1.Route(path, authorization, request_method_enum_1.RequestMethod.DELETE)(target, key, descriptor);
    };
}
exports.Delete = Delete;
//# sourceMappingURL=delete.decorator.js.map