import {DataTypes, ModelAttributeColumnOptions} from "sequelize";
import * as sq from "sequelize-typescript";
import {Model} from "sequelize-typescript";
import {ModelService} from "../service/model.service";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {EntityField} from "../interface/entity-field.class";
import {EntityFieldType} from "../enum/entity-field-type.enum";
import {CalculatedField} from "../interface/calculated-field.class";
import {RuntimeError} from "../../application/error/runtime.error";

export function Calculated(label: string | string[], type: EntityFieldType = EntityFieldType.STRING, includeFields?: string[]): Function {
    return function (target, propertyKey, descriptor): void {
        const options: Partial<ModelAttributeColumnOptions> = {};
        const fields: Dictionary<EntityField> = ModelService.FIELDS[target.constructor.name] || {};
        fields[propertyKey] = new CalculatedField(propertyKey, label, type, includeFields);
        ModelService.FIELDS[target.constructor.name] = fields;
        options.type = DataTypes.VIRTUAL;
        options.get = descriptor.value;
        options.set = function (this: Model, value: string) {
            throw new RuntimeError("Setting of calculated attributes is not supported");
        };
        sq.Column(options)(target, propertyKey, descriptor);
    };
}
