import {ModelAttributeColumnOptions} from "sequelize";
import * as sq from "sequelize-typescript";
import {ModelService} from "../service/model.service";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {EntityField} from "../interface/entity-field.class";
import {EntityFieldType} from "../enum/entity-field-type.enum";

export function Field(label: string, type: EntityFieldType = EntityFieldType.STRING, required: boolean = false, options?: Partial<ModelAttributeColumnOptions>): Function {
    return function (target, propertyKey, descriptor): void {
        const fields: Dictionary<EntityField> = ModelService.FIELDS[target.constructor.name] || {};
        fields[propertyKey] = new EntityField(propertyKey, label, type, required);
        ModelService.FIELDS[target.constructor.name] = fields;
        sq.Column(options)(target, propertyKey, descriptor);
    };
}
