import {Entity} from "../../model/decorator/entity.decorator";
import {DataObject} from "../../model/data-object.model";
import {Field} from "../../model/decorator/field.decorator";
import {Role} from "./role.model";
import {Permission} from "../enum/permission.enum";
import {Reference} from "../../model/decorator/reference.decorator";
import {EntityFieldType} from "../../model/enum/entity-field-type.enum";
import {PermissionService} from "../service/permission.service";
import {AfterCreateHook} from "../../data";
import {Enemene} from "../../../..";

@Entity
export class ViewPermission extends DataObject<ViewPermission> implements AfterCreateHook {

    @Field("View", EntityFieldType.STRING, true)
    view: string;

    @Field("Permissions", EntityFieldType.STRING, true)
    permissions: string;

    @Reference("Role", () => Role, false)
    role: Role;

    roleId: string;

    @Field("actions", EntityFieldType.STRING_ARRAY)
    actions: string[];

    getPermissions(): Permission[] {
        return this.permissions.split("") as Permission[];
    }

    async onAfterCreate(): Promise<void> {
        Enemene.app.inject(PermissionService).buildCache();
    }
}
