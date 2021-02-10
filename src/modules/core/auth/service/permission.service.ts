import {Dictionary} from "../../../../base/type/dictionary.type";
import {uuid} from "../../../../base/type/uuid.type";
import {AbstractUser, ForbiddenError, RoutePermission, ViewPermission} from "..";
import {RouterService} from "../../router/service/router.service";
import {PathDefinition} from "../interface/path-definition.interface";
import {UnauthorizedError} from "../error/unauthorized.error";
import {RequestMethod} from "../../router/enum/request-method.enum";
import {Permission} from "../enum/permission.enum";
import {ViewInitializerService} from "../../view/service/view-initializer.service";
import {Enemene, UnrestrictedRequestContext, View, ViewFieldDefinition} from "../../../..";
import {ObjectNotFoundError} from "../../error/object-not-found.error";
import {RequestContext} from "../../router/interface/request-context.interface";
import {ViewDefinition} from "../../view/class/view-definition.class";
import {serializable} from "../../../../base/type/serializable.type";
import {keyBy, uniq} from "lodash";
import {ConstructorOf} from "../../../../base/constructor-of";

export class PermissionService {

    private permissionCache: Dictionary<{ route: Dictionary<RoutePermission[]>, view: Dictionary<ViewPermission> }, uuid> = {};

    private viewService: ViewInitializerService = Enemene.app.inject(ViewInitializerService);

    public static addViewPermissions(model: Dictionary<serializable>, viewDefinition: ViewDefinition<any>): Dictionary<serializable> {
        return keyBy(Object.values(model).map((field: Dictionary<serializable>) => {
            const viewField: ViewFieldDefinition<any, any> | undefined = viewDefinition.fields.find(f => f.name === field.name);
            if (viewField) {
                field.canCreate = viewField.canCreate;
                field.canUpdate = viewField.canUpdate;
                field.canRemove = viewField.canRemove;
                field.canInsert = viewField.canInsert;
            }
            return field;
        }), "name");
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

        if (Enemene.app.config.developerRoleId && user.roleId === Enemene.app.config.developerRoleId) {
            return;
        }
        const rolePermission: RoutePermission = this.permissionCache[user.roleId]?.route[fullPath]?.find((permission: RoutePermission) => permission.method === pathDefinition.method);
        if (!rolePermission) {
            throw new ObjectNotFoundError();
        }
    }

    public checkActionPermission(view: ViewDefinition<any>, actionName: string, context: RequestContext<AbstractUser>): void {
        const viewActionExists: boolean = !!view.actions.find(a => a.name === actionName);

        if (viewActionExists) {
            throw new ObjectNotFoundError(actionName);
        }

        if (context instanceof UnrestrictedRequestContext) {
            return;
        }

        let viewPermission: ViewPermission;
        if (!context.currentUser) {
            viewPermission = this.permissionCache["PUBLIC"]?.view[view.viewClass.name];
        } else {
            viewPermission = this.permissionCache[context.currentUser.roleId]?.view[view.viewClass.name];
        }
        if (!viewPermission) {
            throw new ForbiddenError();
        }
        if (!view.actions.find(a => a.name === actionName) || !viewPermission.actions.includes(actionName)) {
            throw new ObjectNotFoundError();
        }
    }

    public checkViewPermission(view: ConstructorOf<View<any>>, method: RequestMethod, context: RequestContext<AbstractUser>): void {
        let viewRequestAllowed: boolean = false;
        switch (method) {
            case RequestMethod.GET:
                viewRequestAllowed = true;
                break;
            case RequestMethod.PUT:
                viewRequestAllowed = view.prototype.$view.updatable;
                break;
            case RequestMethod.POST:
                viewRequestAllowed = view.prototype.$view.creatable;
                break;
            case RequestMethod.DELETE:
                viewRequestAllowed = view.prototype.$view.deletable;
                break;
        }
        if (!viewRequestAllowed) {
            throw new ForbiddenError();
        }

        if (context instanceof UnrestrictedRequestContext) {
            return;
        }

        let viewPermission: ViewPermission;
        if (!context.currentUser) {
            viewPermission = this.permissionCache["PUBLIC"]?.view[view.name];
        } else if (Enemene.app.config.developerRoleId && context.currentUser.roleId === Enemene.app.config.developerRoleId) {
            const permissions = [];
            for (const role of Object.values(this.permissionCache)) {
                const permission: ViewPermission | undefined = role.view[view.name];
                if (permission) {
                    permissions.push(...permission.getPermissions());
                }
            }
            if (permissions.length) {
                viewPermission = new ViewPermission({
                    view: view.name,
                    permissions: uniq(permissions).join(""),
                });
            }
        } else {
            viewPermission = this.permissionCache[context.currentUser.roleId]?.view[view.name] ?? this.permissionCache["PUBLIC"]?.view[view.name];
        }
        if (!viewPermission) {
            throw new ObjectNotFoundError("ViewPermission");
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
            this.permissionCache[viewPermission.roleId].view[viewPermission.view] = viewPermission;
        }
    }
}
