import {ModelService} from "../service/model.service";
import {EntityField} from "../interface/entity-field.class";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {CompositionField} from "../interface/composition-field.class";

export function Composition(label: string | string[], classGetter: () => any, required: boolean = true): Function {
    return function (target, propertyKey, descriptor): void {
        const fields: Dictionary<EntityField> = ModelService.MODEL[target.constructor.name] || {};
        fields[propertyKey] = new CompositionField(propertyKey, label, classGetter, `${propertyKey}Id`, required);
        ModelService.MODEL[target.constructor.name] = fields;
        // sq.BelongsTo(classGetter, {
        //     foreignKey: `${propertyKey}Id`,
        //     onDelete: required ? "RESTRICT" : "SET NULL",
        //     onUpdate: "CASCADE",
        // })(target, propertyKey, descriptor);
        // sq.ForeignKey(classGetter)(target, propertyKey);
        // sq.Column({
        //     type: DataType.STRING,
        //     allowNull: !required,
        //     onDelete: "CASCADE",
        //     onUpdate: "RESTRICT",
        // })(target, `${propertyKey}Id`, descriptor);
    };
}
