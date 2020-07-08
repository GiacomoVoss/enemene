import { AbstractUser } from "..";
import { PathDefinition } from "../interface/path-definition.interface";
import { RequestMethod } from "../../router/enum/request-method.enum";
export declare class PermissionService {
    static DEVELOPER_ROLE_ID: string;
    private static permissionCache;
    private static defaultPermissions;
    static buildCache(): Promise<void>;
    static checkRoutePermission(fullPath: string, pathDefinition: PathDefinition, user: AbstractUser): void;
    static checkViewPermission(viewName: string, method: RequestMethod, user: AbstractUser): void;
    private static registerPermission;
}
