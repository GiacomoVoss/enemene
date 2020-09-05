import * as sq from "sequelize-typescript";
import {ModelService} from "../service/model.service";
import {EntityField} from "../interface/entity-field.class";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {CollectionField} from "../interface/collection-field.class";

export function Collection(label: string | string[],
                           classGetter: () => any,
                           foreignKey: string,
                           onUpdate: "SET NULL" | "CASCADE" = "CASCADE",
                           onDelete: "SET NULL" | "CASCADE" = "CASCADE"): Function {
    return function (target, propertyKey): void {
        const fields: Dictionary<EntityField> = ModelService.FIELDS[target.constructor.name] || {};
        fields[propertyKey] = new CollectionField(propertyKey, label, classGetter, foreignKey);
        ModelService.FIELDS[target.constructor.name] = fields;
        sq.HasMany(classGetter, {
            foreignKey,
            onUpdate,
            onDelete
        })(target, propertyKey);
    };
}
