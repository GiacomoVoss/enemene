import {Entity} from "../../model/decorator/entity.decorator";
import {DataObject} from "../../model/data-object.model";
import {Field} from "../../model/decorator/field.decorator";
import {Role} from "./role.model";
import {Permission} from "../enum/permission.enum";
import {Reference} from "../../model/decorator/reference.decorator";
import {EntityFieldType} from "../../model/enum/entity-field-type.enum";
import {PermissionService} from "../service/permission.service";
import {AfterCreateHook} from "../../data";
import {Enemene, ViewObject} from "../../../..";
import {uuid} from "../../../../base/type/uuid.type";

@Entity
export class ViewPermission extends DataObject<ViewPermission> implements AfterCreateHook {

    $displayPattern = "{view} ({permissions})";

    @Reference("View", () => ViewObject, true)
    view: ViewObject;

    viewId: uuid;

    @Field("Permissions", EntityFieldType.STRING, true)
    permissions: string;

    @Reference("Role", () => Role, true)
    role: Role;

    roleId: string;

    @Field("Actions", EntityFieldType.STRING_ARRAY)
    actions: string[];

    getPermissions(): Permission[] {
        return this.permissions.split("") as Permission[];
    }

    async onAfterCreate(): Promise<void> {
        Enemene.app.inject(PermissionService).buildCache();
    }
}
