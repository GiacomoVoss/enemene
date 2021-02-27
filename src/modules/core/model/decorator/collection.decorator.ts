import {ModelService} from "../service/model.service";
import {EntityField} from "../interface/entity-field.class";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {CollectionField} from "../interface/collection-field.class";

export function Collection(label: string | string[],
                           classGetter: () => any,
                           mappedBy?: string): Function {
    return function (target, propertyKey): void {
        const fields: Dictionary<EntityField> = ModelService.MODEL[target.constructor.name] || {};
        fields[propertyKey] = new CollectionField(propertyKey, label, classGetter, mappedBy);
        ModelService.MODEL[target.constructor.name] = fields;
    };
}
