import {Entity} from "../../model/decorator/entity.decorator";
import {DataObject} from "../../model/data-object.model";
import {Field} from "../../model/decorator/field.decorator";
import {Role} from "./role.model";
import {RequestMethod} from "../../router/enum/request-method.enum";
import {Reference} from "../../model/decorator/reference.decorator";
import {EntityFieldType} from "../../model/enum/entity-field-type.enum";

@Entity
export class RoutePermission extends DataObject<RoutePermission> {

    @Field("Route", EntityFieldType.STRING, true)
    route: string;

    @Field("Request-Methode", EntityFieldType.STRING, true)
    method: RequestMethod;

    @Reference("Rolle", () => Role, true)
    role: Role;

    roleId: string;
}
