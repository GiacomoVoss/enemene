import {Dictionary} from "../../../../base/type/dictionary.type";
import {uuid} from "../../../../base/type/uuid.type";
import {AbstractUser, RoutePermission, ViewPermission} from "..";
import {RouterService} from "../../router/service/router.service";
import {PathDefinition} from "../interface/path-definition.interface";
import {UnauthorizedError} from "../error/unauthorized.error";
import {RequestMethod} from "../../router/enum/request-method.enum";
import {Permission} from "../enum/permission.enum";
import {ViewService} from "../../view/service/view.service";
import {Enemene, View} from "../../../..";
import {ObjectNotFoundError} from "../../error/object-not-found.error";
import {ActionConfiguration} from "../../action/interface/action-configuration.interface";
import {ActionParameterConfiguration} from "../../action/interface/action-parameter-configuration.interface";
import {ConstructorOf} from "../../../../base/constructor-of";

export class PermissionService {

    public static DEVELOPER_ROLE_ID: string = "71d13c75-074d-4129-b2e7-99e6852ab3eb";

    private permissionCache: Dictionary<{ route: Dictionary<RoutePermission[]>, view: Dictionary<ViewPermission> }, uuid> = {};

    private defaultPermissions: { route: Dictionary<RoutePermission[]>, view: Dictionary<ViewPermission> } = {
        route: {},
        view: {},
    };

    private viewService: ViewService = Enemene.app.inject(ViewService);

    public async buildCache(): Promise<void> {
        const routePermissions: RoutePermission[] = await RoutePermission.findAll();
        const viewPermissions: ViewPermission[] = await ViewPermission.findAll();

        [...routePermissions, ...viewPermissions].forEach(permission => this.registerPermission(permission));
        this.defaultPermissions = {
            route: {},
            view: {},
        };

        Enemene.log.info(this.constructor.name, `Permission cache built, ${viewPermissions.length + routePermissions.length} permissions found.`);
    }

    public checkRoutePermission(fullPath: string, pathDefinition: PathDefinition, user?: AbstractUser): void {
        if (pathDefinition.isPublic) {
            return;
        }
        if (!user) {
            throw new UnauthorizedError();
        }

        if (user.roleId === PermissionService.DEVELOPER_ROLE_ID) {
            return;
        }
        const rolePermission: RoutePermission = this.permissionCache[user.roleId]?.route[fullPath]?.find((permission: RoutePermission) => permission.method === pathDefinition.method);
        const defaultPermission: RoutePermission = this.defaultPermissions.route[fullPath]?.find((permission: RoutePermission) => permission.method === pathDefinition.method);
        if (!rolePermission && !defaultPermission) {
            throw new ObjectNotFoundError();
        }
    }

    public checkViewPermission(viewName: string, method: RequestMethod, user?: AbstractUser): void {
        let viewPermission: ViewPermission;
        if (!user) {
            viewPermission = this.permissionCache["PUBLIC"]?.view[viewName];
        } else {
            viewPermission = this.permissionCache[user.roleId]?.view[viewName];
        }
        if (user && user.roleId === PermissionService.DEVELOPER_ROLE_ID) {
            return;
        }
        if (!viewPermission) {
            viewPermission = this.defaultPermissions.view[viewName];
        }
        if (!viewPermission) {
            throw new ObjectNotFoundError();
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
            throw new ObjectNotFoundError();
        }
    }

    private registerPermission(permission: RoutePermission | ViewPermission) {
        if (!permission.roleId) {
            permission.roleId = "PUBLIC";
        }
        if (!this.permissionCache[permission.roleId]) {
            this.permissionCache[permission.roleId] = {
                route: {},
                view: {},
            };
        }

        if ((permission as RoutePermission).route) {
            const routePermission = permission as RoutePermission;
            if (!RouterService.hasRoute(routePermission.method, routePermission.route)) {
                Enemene.log.warn(this.constructor.name, `Permission ${routePermission.id} applies to non-existing route "${routePermission.method} ${routePermission.route}".`);
            }
            if (!this.permissionCache[routePermission.roleId].route[routePermission.route]) {
                this.permissionCache[routePermission.roleId].route[routePermission.route] = [];
            }
            this.permissionCache[routePermission.roleId].route[routePermission.route].push(routePermission);
        } else if ((permission as ViewPermission).view) {
            const viewPermission = permission as ViewPermission;
            const view: View<any> = this.viewService.getViewNotNull(viewPermission.view);
            if (!view) {
                Enemene.log.warn(this.constructor.name, `Permission ${viewPermission.id} applies to non-existing view "${viewPermission.view}".`);
            }
            this.permissionCache[viewPermission.roleId].view[viewPermission.view] = viewPermission;
            if (viewPermission.getPermissions().includes(Permission.UPDATE) || viewPermission.getPermissions().includes(Permission.CREATE)) {
                view.getActionConfigurations().forEach((action: ActionConfiguration) => {
                    action.parameters.forEach((param: ActionParameterConfiguration) => {
                        const subView: ConstructorOf<View<any>> = param.config.view as ConstructorOf<View<any>> | undefined;
                        if (subView) {
                            const subViewPermission = new ViewPermission();
                            subViewPermission.roleId = viewPermission.roleId;
                            subViewPermission.role = viewPermission.role;
                            subViewPermission.permissions = "r";
                            subViewPermission.view = `${action.name}_${subView.name}`;
                            subViewPermission.id = "autogenerated";
                            this.registerPermission(subViewPermission);
                        }
                    });
                });
            }
        }
    }
}
