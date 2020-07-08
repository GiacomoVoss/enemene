import { DataObject } from "../../model";
import { RoutePermission } from "./route-permission.model";
import { ViewPermission } from "./view-permission.model";
import { RouteToRole } from "../../router/model/route-to-role.model";
export declare class Role extends DataObject<Role> {
    $displayPattern: string;
    name: string;
    routePermissions: RoutePermission[];
    viewPermissions: ViewPermission[];
    routes: RouteToRole[];
}
