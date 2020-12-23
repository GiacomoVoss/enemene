import {ModelService} from "../service/model.service";
import {EntityField} from "../interface/entity-field.class";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {ReferenceField} from "../interface/reference-field.class";

export function Reference(label: string | string[], classGetter: () => any, required: boolean = false): Function {
    return function (target, propertyKey): void {
        const fields: Dictionary<EntityField> = ModelService.MODEL[target.constructor.name] || {};
        fields[propertyKey] = new ReferenceField(propertyKey, label, classGetter, `${propertyKey}Id`, required);
        // fields[`${propertyKey}Id`] = new EntityField(`${propertyKey}Id`, label + " ID", EntityFieldType.UUID, false);
        ModelService.MODEL[target.constructor.name] = fields;
        // sq.Column({
        //     type: DataType.STRING,
        //     field: propertyKey + "Id",
        //     allowNull: !required,
        // });
        // sq.BelongsTo(classGetter, {
        //     foreignKey: {
        //         field: propertyKey + "Id",
        //         name: propertyKey + "Id",
        //         allowNull: !required,
        //     },
        //     onUpdate: "CASCADE",
        //     onDelete: required ? "RESTRICT" : "SET NULL",
        //     constraints: true,
        //     foreignKeyConstraint: true
        // })(target, propertyKey);
    };
}
