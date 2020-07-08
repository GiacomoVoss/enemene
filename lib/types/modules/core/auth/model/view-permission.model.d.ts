import { DataObject } from "../../model/data-object.model";
import { Role } from "./role.model";
import { Permission } from "../enum/permission.enum";
export declare class ViewPermission extends DataObject<ViewPermission> {
    view: string;
    permissions: string;
    role: Role;
    roleId: string;
    getPermissions(): Permission[];
}
