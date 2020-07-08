import { DataObject } from "../../model/data-object.model";
import { Role } from "../../auth/model/role.model";
export declare class RouteToRole extends DataObject<RouteToRole> {
    $displayPattern: string;
    role: Role;
    roleId: string;
    route: string;
}
