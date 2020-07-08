"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authorization = void 0;
var Authorization;
(function (Authorization) {
    /**
     * Route permissions are evaluated. If the requesting user has a permission for this route and method, everything happening inside the handler is permitted.
     */
    Authorization["ROUTE"] = "ROUTE";
    /**
     * No permission evaluation. Handle with care!
     */
    Authorization["PUBLIC"] = "PUBLIC";
})(Authorization = exports.Authorization || (exports.Authorization = {}));
//# sourceMappingURL=authorization.enum.js.map