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
import {ObjectNotFoundError} from "../../error/object-not-found.error";
import chalk from "chalk";
import {RequestContext} from "../../router/interface/request-context.interface";
import {ViewDefinition} from "../../view/class/view-definition.class";

export class PermissionService {

    private permissionCache: Dictionary<{ route: Dictionary<RoutePermission[]>, view: Dictionary<ViewPermission> }, uuid> = {};

    private viewService: ViewService = Enemene.app.inject(ViewService);

    public async buildCache(): Promise<void> {
        const routePermissions: RoutePermission[] = await RoutePermission.findAll();
        const viewPermissions: ViewPermission[] = await ViewPermission.findAll();

        [...routePermissions, ...viewPermissions].forEach(permission => this.registerPermission(permission));

        Enemene.log.info(this.constructor.name, `Permission cache built, ${viewPermissions.length + routePermissions.length} permissions found.`);
    }

    public checkRoutePermission(fullPath: string, pathDefinition: PathDefinition, user?: AbstractUser): void {
        if (pathDefinition.isPublic) {
            return;
        }
        if (!user) {
            throw new UnauthorizedError();
        }

        if (Enemene.app.config.developerRoleId && user.roleId === Enemene.app.config.developerRoleId) {
            return;
        }
        const rolePermission: RoutePermission = this.permissionCache[user.roleId]?.route[fullPath]?.find((permission: RoutePermission) => permission.method === pathDefinition.method);
        if (!rolePermission) {
            throw new ObjectNotFoundError();
        }
    }

    public checkActionPermission(viewName: string, actionName: string, context: RequestContext<AbstractUser>): void {
        let viewPermission: ViewPermission;
        if (!context.currentUser) {
            viewPermission = this.permissionCache["PUBLIC"]?.view[viewName];
        } else {
            viewPermission = this.permissionCache[context.currentUser.roleId]?.view[viewName];
        }
        if (context.currentUser && Enemene.app.config.developerRoleId && context.currentUser.roleId === Enemene.app.config.developerRoleId) {
            return;
        }
        if (!viewPermission) {
            throw new ObjectNotFoundError();
        }
        if (!viewPermission.actions.includes(actionName)) {
            throw new ObjectNotFoundError();
        }
    }

    public checkViewPermission(viewName: string, method: RequestMethod, context: RequestContext<AbstractUser>): void {
        let viewPermission: ViewPermission;
        if (!context.currentUser) {
            viewPermission = this.permissionCache["PUBLIC"]?.view[viewName];
        } else {
            viewPermission = this.permissionCache[context.currentUser.roleId]?.view[viewName] ?? this.permissionCache["PUBLIC"]?.view[viewName];
        }
        if (context.currentUser && Enemene.app.config.developerRoleId && context.currentUser.roleId === Enemene.app.config.developerRoleId) {
            return;
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
            const viewDefinition: ViewDefinition<any> = this.viewService.getViewDefinition(viewPermission.view);
            if (!viewDefinition) {
                Enemene.log.warn(this.constructor.name, `Permission ${chalk.bold(viewPermission.id)} applies to non-existing view ${chalk.bold(viewPermission.view)}.`);
            }
            this.permissionCache[viewPermission.roleId].view[viewPermission.view] = viewPermission;
        }
    }
}
