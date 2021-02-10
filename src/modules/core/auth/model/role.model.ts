import {Collection, DataObject, Entity, EntityFieldType, Field} from "../../model";
import {RoutePermission} from "./route-permission.model";
import {ViewPermission} from "./view-permission.model";
import {PermissionService} from "../service/permission.service";
import {AfterCreateHook} from "../../data";
import {Enemene} from "../../../..";

@Entity
export class Role extends DataObject<Role> implements AfterCreateHook {

    $displayPattern = "{name}";

    @Field("Name", EntityFieldType.STRING, true)
    name: string;

    @Collection("Routen-Berechtigungen", () => RoutePermission, "roleId", "role")
    routePermissions: RoutePermission[];

    @Collection("View-Berechtigungen", () => ViewPermission, "roleId", "role")
    viewPermissions: ViewPermission[];


    async onAfterCreate(): Promise<void> {
        Enemene.app.inject(PermissionService).buildCache();
    }
}
