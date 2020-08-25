import {DataTypes, ModelAttributeColumnOptions} from "sequelize";
import * as sq from "sequelize-typescript";
import {Model} from "sequelize-typescript";
import {ModelService} from "../service/model.service";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {EntityField} from "../interface/entity-field.class";
import {EntityFieldType} from "../enum/entity-field-type.enum";

export function Field(label: string, type: EntityFieldType = EntityFieldType.STRING, required: boolean = false, options: Partial<ModelAttributeColumnOptions> = {}): Function {
    return function (target, propertyKey, descriptor): void {
        const fields: Dictionary<EntityField> = ModelService.FIELDS[target.constructor.name] || {};
        fields[propertyKey] = new EntityField(propertyKey, label, type, required);
        ModelService.FIELDS[target.constructor.name] = fields;
        if (type === EntityFieldType.STRING_ARRAY) {
            options.type = DataTypes.JSON;
            options.get = function (this: Model) {
                const value = this.getDataValue(propertyKey);
                return value ? JSON.parse(value) : undefined;
            };
            options.set = function (this: Model, value: string) {
                this.setDataValue(propertyKey, value);
            };
        } else if (type === EntityFieldType.TEXT) {
            options.type = DataTypes.TEXT;
        } else if (Array.isArray(type)) {
            options.type = DataTypes.ENUM;
            options.values = type;
        }
        sq.Column(options)(target, propertyKey, descriptor);
    };
}
