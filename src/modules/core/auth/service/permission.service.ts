import {Dictionary} from "../../../../base/type/dictionary.type";
import {uuid} from "../../../../base/type/uuid.type";
import {AbstractUser, RoutePermission, ViewPermission} from "..";
import {RouterService} from "../../router/service/router.service";
import {PathDefinition} from "../interface/path-definition.interface";
import {UnauthorizedError} from "../error/unauthorized.error";
import {RequestMethod} from "../../router/enum/request-method.enum";
import {Permission} from "../enum/permission.enum";
import {ViewService} from "../../view/service/view.service";
import {Enemene} from "../../../..";

export class PermissionService {

    public static DEVELOPER_ROLE_ID: string = "71d13c75-074d-4129-b2e7-99e6852ab3eb";

    private static permissionCache: Dictionary<{ route: Dictionary<RoutePermission[]>, view: Dictionary<ViewPermission> }, uuid> = {};

    private static defaultPermissions: { route: Dictionary<RoutePermission[]>, view: Dictionary<ViewPermission> } = {
        route: {},
        view: {},
    };

    public static async buildCache(): Promise<void> {
        const routePermissions: RoutePermission[] = await RoutePermission.findAll();
        const viewPermissions: ViewPermission[] = await ViewPermission.findAll();

        [...routePermissions, ...viewPermissions].forEach(this.registerPermission);
        PermissionService.defaultPermissions = {
            route: {
                "/route": [
                    new RoutePermission({
                        id: "ee47f493-c159-4d13-b585-8d9b6c99b45e",
                        route: "/route",
                        method: RequestMethod.GET,
                    }),
                ],
                "/view/:view": [
                    new RoutePermission({
                        id: "72d279de-5af3-4585-a9d2-0e6d97c9dca2",
                        route: "/view/:view",
                        method: RequestMethod.GET,
                    }),
                ],
                "/view/:view/:id": [
                    new RoutePermission({
                        id: "bc24ad23-6bea-4b38-a2ca-f82019ce2d63",
                        route: "/view/:view/:id",
                        method: RequestMethod.GET,
                    }),
                ],
                "/action/:action": [
                    new RoutePermission({
                        id: "43173460-84e7-433c-836a-67251db83c91",
                        route: "/action/:action",
                        method: RequestMethod.GET,
                    }),
                ],
            },
            view: {},
        };

        Enemene.log.info(this.name, `Permission cache built, ${viewPermissions.length + routePermissions.length} permissions found.`);
    }

    public static checkRoutePermission(fullPath: string, pathDefinition: PathDefinition, user: AbstractUser): void {
        if (user.roleId === this.DEVELOPER_ROLE_ID) {
            return;
        }
        const rolePermission: RoutePermission = PermissionService.permissionCache[user.roleId]?.route[fullPath]?.find((permission: RoutePermission) => permission.method === pathDefinition.method);
        const defaultPermission: RoutePermission = PermissionService.defaultPermissions.route[fullPath]?.find((permission: RoutePermission) => permission.method === pathDefinition.method);
        if (!rolePermission && !defaultPermission) {
            throw new UnauthorizedError();
        }
    }

    public static checkViewPermission(viewName: string, method: RequestMethod, user: AbstractUser): void {
        if (user.roleId === this.DEVELOPER_ROLE_ID) {
            return;
        }
        let viewPermission: ViewPermission = PermissionService.permissionCache[user.roleId]?.view[viewName];
        if (!viewPermission) {
            viewPermission = PermissionService.defaultPermissions.view[viewName];
        }
        if (!viewPermission) {
            throw new UnauthorizedError();
        }
        let permitted: boolean = false;
        switch (method) {
            case RequestMethod.GET:
                permitted = viewPermission.getPermissions().includes(Permission.READ);
                break;
            case RequestMethod.PUT:
                permitted = viewPermission.getPermissions().includes(Permission.UPDATE);
                break;
            case RequestMethod.POST:
                permitted = viewPermission.getPermissions().includes(Permission.CREATE);
                break;
            case RequestMethod.DELETE:
                permitted = viewPermission.getPermissions().includes(Permission.DELETE);
                break;
        }
        if (!permitted) {
            throw new UnauthorizedError();
        }
    }

    private static registerPermission(permission: RoutePermission | ViewPermission) {
        if (!PermissionService.permissionCache[permission.roleId]) {
            PermissionService.permissionCache[permission.roleId] = {
                route: {},
                view: {},
            };
        }

        if ((permission as RoutePermission).route) {
            const routePermission = permission as RoutePermission;
            if (!RouterService.hasRoute(routePermission.method, routePermission.route)) {
                Enemene.log.warn(this.name, `Permission ${routePermission.id} applies to non-existing route "${routePermission.method} ${routePermission.route}".`);
            }
            if (!PermissionService.permissionCache[routePermission.roleId].route[routePermission.route]) {
                PermissionService.permissionCache[routePermission.roleId].route[routePermission.route] = [];
            }
            PermissionService.permissionCache[routePermission.roleId].route[routePermission.route].push(routePermission);
        } else if ((permission as ViewPermission).view) {
            const viewPermission = permission as ViewPermission;
            if (!ViewService.getView(viewPermission.view)) {
                Enemene.log.warn(this.name, `Permission ${viewPermission.id} applies to non-existing view "${viewPermission.view}".`);
            }
            PermissionService.permissionCache[viewPermission.roleId].view[viewPermission.view] = viewPermission;
        }
    }
}
