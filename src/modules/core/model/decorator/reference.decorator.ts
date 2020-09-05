import * as sq from "sequelize-typescript";
import {DataType} from "sequelize-typescript";
import {ModelService} from "../service/model.service";
import {EntityField} from "../interface/entity-field.class";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {ReferenceField} from "../interface/reference-field.class";
import {EntityFieldType} from "../enum/entity-field-type.enum";

export function Reference(label: string | string[], classGetter: () => any, required: boolean = false): Function {
    return function (target, propertyKey): void {
        const fields: Dictionary<EntityField> = ModelService.FIELDS[target.constructor.name] || {};
        fields[propertyKey] = new ReferenceField(propertyKey, label, classGetter, `${propertyKey}Id`, required);
        fields[`${propertyKey}Id`] = new EntityField(`${propertyKey}Id`, label + " ID", EntityFieldType.UUID, false);
        ModelService.FIELDS[target.constructor.name] = fields;
        sq.BelongsTo(classGetter, {
            foreignKey: propertyKey + "Id",
        })(target, propertyKey);
        sq.ForeignKey(classGetter)(target, propertyKey);
        sq.Column({
            type: DataType.STRING,
            field: propertyKey + "Id",
            allowNull: !required,
        });
    };
}
