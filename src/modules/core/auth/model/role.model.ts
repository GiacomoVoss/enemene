import {Calculated, Collection, DataObject, Entity, EntityFieldType, Field} from "../../model";
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

    @Collection("Route permissions", () => RoutePermission, "role")
    routePermissions: RoutePermission[];

    @Collection("View permissions", () => ViewPermission, "role")
    viewPermissions: ViewPermission[];

    @Calculated("Is developer")
    isDeveloper(): boolean {
        return Enemene.app.config.developerRoleId === this.id;
    }

    @Calculated("Is anonymous")
    isAnonymous(): boolean {
        return Enemene.app.config.anonymousRoleId === this.id;
    }

    async onAfterCreate(): Promise<void> {
        Enemene.app.inject(PermissionService).buildCache();
    }
}
