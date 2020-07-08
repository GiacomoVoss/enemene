import {ForeignKey} from "sequelize-typescript";
import {Entity} from "../../model/decorator/entity.decorator";
import {DataObject} from "../../model/data-object.model";
import {Reference} from "../../model/decorator/reference.decorator";
import {Role} from "../../auth/model/role.model";
import {EntityFieldType} from "../../model/enum/entity-field-type.enum";
import {Field} from "../../model/decorator/field.decorator";

@Entity
export class RouteToRole extends DataObject<RouteToRole> {

    $displayPattern: string = "{route}";

    @Reference("Rolle", () => Role)
    role: Role;

    @ForeignKey(() => Role)
    roleId: string;

    @Field("Route", EntityFieldType.STRING, true)
    route: string;
}
