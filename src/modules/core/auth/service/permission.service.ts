import {Dictionary} from "../../../../base/type/dictionary.type";
import {uuid} from "../../../../base/type/uuid.type";
import {AbstractUser, ForbiddenError, RoutePermission, ViewPermission} from "..";
import {RouterService} from "../../router/service/router.service";
import {PathDefinition} from "../interface/path-definition.interface";
import {UnauthorizedError} from "../error/unauthorized.error";
import {RequestMethod} from "../../router/enum/request-method.enum";
import {Permission} from "../enum/permission.enum";
import {Enemene, UnrestrictedRequestContext, View, ViewFieldDefinition} from "../../../..";
import {ObjectNotFoundError} from "../../error/object-not-found.error";
import {RequestContext} from "../../router/interface/request-context.interface";
import {ViewDefinition} from "../../view/class/view-definition.class";
import {ConstructorOf} from "../../../../base/constructor-of";

export class PermissionService {

    private permissionCache: Dictionary<{ route: Dictionary<RoutePermission[]>, view: Dictionary<ViewPermission> }, uuid> = {};

    public getViewFieldPermissions(viewDefinition: ViewDefinition<any>, viewField: ViewFieldDefinition<any, any>, context: RequestContext<AbstractUser>): Dictionary<boolean> {
        const viewPermission: ViewPermission | undefined = this.findViewPermission(viewDefinition.viewClass, context);
        const result: Dictionary<boolean> = {};
        if (viewField.canCreate ?? viewPermission?.permissions.includes(Permission.CREATE) ?? false) {
            result.canCreate = viewField.canCreate ?? viewPermission?.permissions.includes(Permission.CREATE);
        }
        if (viewField.canUpdate ?? viewPermission?.permissions.includes(Permission.UPDATE) ?? false) {
            result.canUpdate = viewField.canUpdate ?? viewPermission?.permissions.includes(Permission.UPDATE);
        }
        if (viewField.isArray) {
            if (viewField.canRemove ?? viewPermission?.permissions.includes(Permission.UPDATE) ?? false) {
                result.canRemove = viewField.canRemove ?? viewField.canUpdate ?? viewPermission?.permissions.includes(Permission.UPDATE);
            }
            if (viewField.canInsert ?? viewPermission?.permissions.includes(Permission.UPDATE) ?? false) {
                result.canInsert = viewField.canInsert ?? viewField.canUpdate ?? viewPermission?.permissions.includes(Permission.UPDATE);
            }
        }
        return result;
    }

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

        if (user.isPopulator) {
            return;
        }

        const rolePermission: RoutePermission = this.permissionCache[user.roleId]?.route[fullPath]?.find((permission: RoutePermission) => permission.method === pathDefinition.method);
        if (!rolePermission) {
            throw new ObjectNotFoundError();
        }
    }

    public checkActionPermission(view: ViewDefinition<any>, actionName: string, context: RequestContext<AbstractUser>): void {
        const viewActionExists: boolean = !!view.actions.find(a => a.name === actionName);

        if (!viewActionExists) {
            throw new ForbiddenError();
        }

        if (context instanceof UnrestrictedRequestContext || context.currentUser.isPopulator) {
            return;
        }

        const viewPermission: ViewPermission = this.findViewPermission(view.viewClass, context);

        if (!viewPermission) {
            throw new ForbiddenError();
        }

        if (!viewPermission.actions.includes(actionName)) {
            throw new ForbiddenError();
        }
    }

    public checkViewPermission(view: ConstructorOf<View<any>>, method: RequestMethod, context: RequestContext<AbstractUser>): void {
        if (context instanceof UnrestrictedRequestContext || context.currentUser.isPopulator) {
            return;
        }

        const viewPermission: ViewPermission = this.findViewPermission(view, context);

        if (!viewPermission) {
            throw new ObjectNotFoundError("ViewPermission for " + view.name);
        }

        let permitted: boolean = false;
        switch (method) {
            case RequestMethod.GET:
                permitted = viewPermission.getPermissions().includes(Permission.READ) || viewPermission.getPermissions().includes(Permission.UPDATE) || viewPermission.getPermissions().includes(Permission.DELETE);
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

    private findViewPermission(view: ConstructorOf<View<any>>, context: RequestContext<AbstractUser>): ViewPermission | undefined {
        let viewPermission: ViewPermission;
        if (!context.currentUser) {
            viewPermission = this.permissionCache["PUBLIC"]?.view[view.name];
        } else {
            viewPermission = this.permissionCache[context.currentUser.roleId]?.view[view.name] ?? this.permissionCache["PUBLIC"]?.view[view.name];
        }

        return viewPermission;
    }

    private registerPermission(permission: RoutePermission | ViewPermission) {
        const developerRoleId: uuid | undefined = Enemene.app.config.developerRoleId;
        if (!permission.roleId) {
            permission.roleId = "PUBLIC";
        }
        if (!this.permissionCache[permission.roleId]) {
            this.permissionCache[permission.roleId] = {
                route: {},
                view: {},
            };
        }

        if (developerRoleId && !this.permissionCache[developerRoleId]) {
            this.permissionCache[developerRoleId] = {
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
            if (developerRoleId) {
                if (!this.permissionCache[developerRoleId].route[routePermission.route]) {
                    this.permissionCache[developerRoleId].route[routePermission.route] = [];
                }
                this.permissionCache[developerRoleId].route[routePermission.route].push(routePermission);
            }
        } else if ((permission as ViewPermission).viewId) {
            const viewPermission = permission as ViewPermission;
            this.permissionCache[viewPermission.roleId].view[viewPermission.view.name] = viewPermission;
            this.permissionCache[viewPermission.roleId].view[viewPermission.view.id] = viewPermission;
            if (developerRoleId) {
                this.permissionCache[developerRoleId].view[viewPermission.view.name] = viewPermission;
                this.permissionCache[developerRoleId].view[viewPermission.view.id] = viewPermission;
            }
        }
    }
}
