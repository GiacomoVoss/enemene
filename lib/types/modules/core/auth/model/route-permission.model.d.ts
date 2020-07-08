import { DataObject } from "../../model/data-object.model";
import { Role } from "./role.model";
import { RequestMethod } from "../../router/enum/request-method.enum";
export declare class RoutePermission extends DataObject<RoutePermission> {
    route: string;
    method: RequestMethod;
    role: Role;
    roleId: string;
}
