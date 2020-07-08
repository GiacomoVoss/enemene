import {Entity} from "../../model/decorator/entity.decorator";
import {DataObject} from "../../model/data-object.model";
import {Field} from "../../model/decorator/field.decorator";
import {Role} from "./role.model";
import {Permission} from "../enum/permission.enum";
import {Reference} from "../../model/decorator/reference.decorator";
import {EntityFieldType} from "../../model/enum/entity-field-type.enum";

@Entity
export class ViewPermission extends DataObject<ViewPermission> {

    @Field("View", EntityFieldType.STRING, true)
    view: string;

    @Field("Berechtigungen", EntityFieldType.STRING, true)
    permissions: string;

    @Reference("Rolle", () => Role, true)
    role: Role;

    roleId: string;

    getPermissions(): Permission[] {
        return this.permissions.split("") as Permission[];
    }
}
