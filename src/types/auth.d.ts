import {uuid} from "./base";
import {RequestMethod} from "./controller";
import {DataObject} from "./model";

/**
 * Extend this abstract class to define the User model uses as authentication for users.
 */
export declare abstract class AbstractUser extends DataObject<AbstractUser> {

    /**
     * A string array of fields defining which attributes should be included in a JWT when creating one on login.
     */
    $includeInToken: string[];

    /**
     * The username.
     */
    username: string;

    /**
     * The password. Will be bcrypt hashed automatically.
     */
    password: string;

    /**
     * The role this user has.
     */
    role: Role;

    /**
     * The ID of the role this user has.
     */
    roleId: uuid;
}

/**
 * A role can be assigned to a user and specifies the permissions on controller routes and views this user has.
 */
export declare class Role extends DataObject<Role> {

    /**
     * The name of the role, e.g. "Administrator".
     */
    name: string;

    /**
     * A collection of route permissions this role has.
     */
    routePermissions: RoutePermission[];

    /**
     * A collection of view permissions this role has.
     */
    viewPermissions: ViewPermission[];
}

/**
 * A route permission defines the permission to execute a controller route method.
 */
export declare class RoutePermission extends DataObject<RoutePermission> {

    /**
     * The route as a URI path, starting at the api's base level, including parameters.
     * @example /role/:id
     */
    route: string;

    /**
     * The HTTP request method that gets granted through this permission, since a route can provide multiple request methods.
     */
    method: RequestMethod;

    /**
     * The role this permission is assigned to.
     */
    role: Role;

    /**
     * The ID of the role this permission is assign to.
     */
    roleId: string;
}

/**
 * A view permission defines the permission to use a view for data access and mutation.
 */
export declare class ViewPermission extends DataObject<ViewPermission> {

    /**
     * The view's name.
     */
    view: string;

    /**
     * The role this permission is assigned to.
     */
    role: Role;

    /**
     * The ID of the role this permission is assign to.
     */
    roleId: string;

    /**
     * The actions that are permitted to execute on this view.
     */
    actions: string[];

    /**
     * The permissions that are granted for this view.
     */
    getPermissions(): Permission[];
}

/**
 * Possible permission values for {@link ViewPermission}s.
 */
export declare enum Permission {
    READ = "r",
    CREATE = "c",
    UPDATE = "u",
    DELETE = "d",
}
