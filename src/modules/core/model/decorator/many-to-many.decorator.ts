import {ModelService} from "../service/model.service";
import {EntityField} from "../interface/entity-field.class";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {ManyToManyField} from "../interface/many-to-many-field.class";

export function ManyToMany(label: string | string[], classGetter: () => any, throughGetter?: () => any): Function {
    return function (target, propertyKey): void {
        const fields: Dictionary<EntityField> = ModelService.MODEL[target.constructor.name] || {};
        fields[propertyKey] = new ManyToManyField(propertyKey, label, classGetter, throughGetter);
        ModelService.MODEL[target.constructor.name] = fields;
    };
}
