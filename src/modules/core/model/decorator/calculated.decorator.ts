import {ModelService} from "../service/model.service";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {EntityField} from "../interface/entity-field.class";
import {EntityFieldType} from "../enum/entity-field-type.enum";
import {CalculatedField} from "../interface/calculated-field.class";
import {ConstructorOf} from "../../../../base/constructor-of";
import {DataObject} from "../data-object.model";

export function Calculated(label: string | string[], type: EntityFieldType = EntityFieldType.STRING, classGetter?: () => ConstructorOf<DataObject<any>>, includeFields?: string[]): Function {
    return function (target, propertyKey, descriptor): void {
        const fields: Dictionary<EntityField> = ModelService.MODEL[target.constructor.name] || {};
        fields[propertyKey] = new CalculatedField(propertyKey, label, type, descriptor.value, classGetter, includeFields);
        ModelService.MODEL[target.constructor.name] = fields;
    };
}
