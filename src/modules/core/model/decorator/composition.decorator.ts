import * as sq from "sequelize-typescript";
import {DataType} from "sequelize-typescript";
import {ModelService} from "../service/model.service";
import {EntityField} from "../interface/entity-field.class";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {CompositionField} from "../interface/composition-field.class";

export function Composition(label: string, classGetter: () => any, required: boolean = true): Function {
    return function (target, propertyKey, descriptor): void {
        const fields: Dictionary<EntityField> = ModelService.FIELDS[target.constructor.name] || {};
        fields[propertyKey] = new CompositionField(propertyKey, label, classGetter, `${propertyKey}Id`, required);
        ModelService.FIELDS[target.constructor.name] = fields;
        sq.BelongsTo(classGetter, {
            foreignKey: `${propertyKey}Id`
        })(target, propertyKey, descriptor);
        sq.Column({
            type: DataType.STRING,
            allowNull: !required
        })(target, `${propertyKey}Id`, descriptor);
    };
}
