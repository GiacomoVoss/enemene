import {ModelService} from "../service/model.service";
import * as sq from "sequelize-typescript";
import {EntityField} from "../interface/entity-field.class";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {ManyToManyField} from "../interface/many-to-many-field.class";

export function ManyToMany(label: string, classGetter: () => any, throughGetter: () => any): Function {
    return function (target, propertyKey): void {
        const fields: Dictionary<EntityField> = ModelService.FIELDS[target.constructor.name] || {};
        fields[propertyKey] = new ManyToManyField(propertyKey, label, classGetter, throughGetter);
        ModelService.FIELDS[target.constructor.name] = fields;
        sq.BelongsToMany(classGetter, throughGetter)(target, propertyKey);
    };
}
