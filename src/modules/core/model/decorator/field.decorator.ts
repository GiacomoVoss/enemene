import {ModelAttributeColumnOptions} from "sequelize";
import {ModelService} from "../service/model.service";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {EntityField} from "../interface/entity-field.class";
import {EntityFieldType} from "../enum/entity-field-type.enum";

export function Field(label: string | string[], type: EntityFieldType = EntityFieldType.STRING, required: boolean = false, options: Pick<ModelAttributeColumnOptions, "defaultValue"> = {}): Function {
    return function (target, propertyKey, descriptor): void {
        const fields: Dictionary<EntityField> = ModelService.MODEL[target.constructor.name] || {};
        fields[propertyKey] = new EntityField(propertyKey, label, type, required, options);
        ModelService.MODEL[target.constructor.name] = fields;
    };
}
