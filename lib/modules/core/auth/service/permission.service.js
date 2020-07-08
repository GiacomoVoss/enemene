"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionService = void 0;
const __1 = require("..");
const router_service_1 = require("../../router/service/router.service");
const unauthorized_error_1 = require("../error/unauthorized.error");
const request_method_enum_1 = require("../../router/enum/request-method.enum");
const permission_enum_1 = require("../enum/permission.enum");
const view_service_1 = require("../../view/service/view.service");
const log_1 = require("../../log");
class PermissionService {
    static buildCache() {
        return __awaiter(this, void 0, void 0, function* () {
            const routePermissions = yield __1.RoutePermission.findAll();
            const viewPermissions = yield __1.ViewPermission.findAll();
            [...routePermissions, ...viewPermissions].forEach(this.registerPermission);
            PermissionService.defaultPermissions = {
                route: {
                    "/route": [
                        new __1.RoutePermission({
                            id: "ee47f493-c159-4d13-b585-8d9b6c99b45e",
                            route: "/route",
                            method: request_method_enum_1.RequestMethod.GET,
                        }),
                    ],
                    "/view/:view": [
                        new __1.RoutePermission({
                            id: "72d279de-5af3-4585-a9d2-0e6d97c9dca2",
                            route: "/view/:view",
                            method: request_method_enum_1.RequestMethod.GET,
                        }),
                    ],
                    "/view/:view/:id": [
                        new __1.RoutePermission({
                            id: "bc24ad23-6bea-4b38-a2ca-f82019ce2d63",
                            route: "/view/:view/:id",
                            method: request_method_enum_1.RequestMethod.GET,
                        }),
                    ],
                },
                view: {},
            };
            log_1.LogService.log.info(`[PermissionService] Permission cache built, ${viewPermissions.length + routePermissions.length} permissions found.`);
        });
    }
    static checkRoutePermission(fullPath, pathDefinition, user) {
        var _a, _b, _c;
        if (user.roleId === this.DEVELOPER_ROLE_ID) {
            return;
        }
        const rolePermission = (_b = (_a = PermissionService.permissionCache[user.roleId]) === null || _a === void 0 ? void 0 : _a.route[fullPath]) === null || _b === void 0 ? void 0 : _b.find((permission) => permission.method === pathDefinition.method);
        const defaultPermission = (_c = PermissionService.defaultPermissions.route[fullPath]) === null || _c === void 0 ? void 0 : _c.find((permission) => permission.method === pathDefinition.method);
        if (!rolePermission && !defaultPermission) {
            throw new unauthorized_error_1.UnauthorizedError();
        }
    }
    static checkViewPermission(viewName, method, user) {
        var _a;
        if (user.roleId === this.DEVELOPER_ROLE_ID) {
            return;
        }
        let viewPermission = (_a = PermissionService.permissionCache[user.roleId]) === null || _a === void 0 ? void 0 : _a.view[viewName];
        if (!viewPermission) {
            viewPermission = PermissionService.defaultPermissions.view[viewName];
        }
        if (!viewPermission) {
            throw new unauthorized_error_1.UnauthorizedError();
        }
        let permitted = false;
        switch (method) {
            case request_method_enum_1.RequestMethod.GET:
                permitted = viewPermission.getPermissions().includes(permission_enum_1.Permission.READ);
                break;
            case request_method_enum_1.RequestMethod.PUT:
                permitted = viewPermission.getPermissions().includes(permission_enum_1.Permission.UPDATE);
                break;
            case request_method_enum_1.RequestMethod.POST:
                permitted = viewPermission.getPermissions().includes(permission_enum_1.Permission.CREATE);
                break;
            case request_method_enum_1.RequestMethod.DELETE:
                permitted = viewPermission.getPermissions().includes(permission_enum_1.Permission.DELETE);
                break;
        }
        if (!permitted) {
            throw new unauthorized_error_1.UnauthorizedError();
        }
    }
    static registerPermission(permission) {
        if (!PermissionService.permissionCache[permission.roleId]) {
            PermissionService.permissionCache[permission.roleId] = {
                route: {},
                view: {},
            };
        }
        if (permission.route) {
            const routePermission = permission;
            if (!router_service_1.RouterService.hasRoute(routePermission.method, routePermission.route)) {
                log_1.LogService.log.warn(`[PermissionService] Permission ${routePermission.id} applies to non-existing route "${routePermission.method} ${routePermission.route}".`);
            }
            if (!PermissionService.permissionCache[routePermission.roleId].route[routePermission.route]) {
                PermissionService.permissionCache[routePermission.roleId].route[routePermission.route] = [];
            }
            PermissionService.permissionCache[routePermission.roleId].route[routePermission.route].push(routePermission);
        }
        else if (permission.view) {
            const viewPermission = permission;
            if (!view_service_1.ViewService.getView(viewPermission.view)) {
                log_1.LogService.log.warn(`[PermissionService] Permission ${viewPermission.id} applies to non-existing view "${viewPermission.view}".`);
            }
            PermissionService.permissionCache[viewPermission.roleId].view[viewPermission.view] = viewPermission;
        }
    }
}
exports.PermissionService = PermissionService;
PermissionService.DEVELOPER_ROLE_ID = "71d13c75-074d-4129-b2e7-99e6852ab3eb";
PermissionService.permissionCache = {};
PermissionService.defaultPermissions = {
    route: {},
    view: {},
};
//# sourceMappingURL=permission.service.js.map