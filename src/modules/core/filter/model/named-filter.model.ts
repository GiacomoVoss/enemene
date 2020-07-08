import {Entity} from "../../model/decorator/entity.decorator";
import {DataObject} from "../../model/data-object.model";
import {Field} from "../../model/decorator/field.decorator";
import {DataTypes} from "sequelize";
import {EntityFieldType} from "../../model/enum/entity-field-type.enum";

@Entity
export class NamedFilter extends DataObject<NamedFilter> {

    @Field("Name", EntityFieldType.STRING, true)
    name: string;

    @Field("Entität", EntityFieldType.STRING, true)
    entity: string;

    @Field("Filter", EntityFieldType.STRING, true, {
        type: DataTypes.JSON,
    })
    filter: string;
}
