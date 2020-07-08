import {Collection, DataObject, Entity, EntityFieldType, Field} from "../../model";
import {RoutePermission} from "./route-permission.model";
import {ViewPermission} from "./view-permission.model";
import {RouteToRole} from "../../router/model/route-to-role.model";

@Entity
export class Role extends DataObject<Role> {

    $displayPattern = "{name}";

    @Field("Name", EntityFieldType.STRING, true)
    name: string;

    @Collection("Routen-Berechtigungen", () => RoutePermission, "roleId")
    routePermissions: RoutePermission[];

    @Collection("View-Berechtigungen", () => ViewPermission, "roleId")
    viewPermissions: ViewPermission[];

    @Collection("Routen", () => RouteToRole, "roleId")
    routes: RouteToRole[];
}
