import {EntityField} from "../interface/entity-field.class";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {uniq} from "lodash";
import {DataObject} from "../data-object.model";
import {ManyToManyField} from "../interface/many-to-many-field.class";
import {CompositionField} from "../interface/composition-field.class";
import {CollectionField} from "../interface/collection-field.class";
import {ReferenceField} from "../interface/reference-field.class";
import {EntityFieldType} from "../enum/entity-field-type.enum";
import {Enemene} from "../../application/enemene";
import {EntityModel} from "../type/entity-model.type";

export class ModelService {

    public static FIELDS: Dictionary<Dictionary<EntityField>> = {};

    public static getFields<T>(entity: string): Dictionary<EntityField, keyof T> {
        return (ModelService.FIELDS[entity] || {}) as Dictionary<EntityField, keyof T>;
    }

    public static getModel(entity: string, requestedFields: string[]): EntityModel {
        return {
            ...this.getModelInternal(entity, requestedFields),
            $root: entity,
        };
    }

    private static getModelInternal(entity: string, requestedFields: string[]): Dictionary<Dictionary<EntityField>> {
        let result: Dictionary<Dictionary<EntityField>> = {
            [entity]: {},
        };
        const requestedBaseFields: string[] = uniq(requestedFields.map((field: string) => field.replace(/\..*/, "")));
        const modelFields: Dictionary<EntityField> = ModelService.FIELDS[entity];
        const fields: EntityField[] = Object.values(modelFields)
            .filter((field: EntityField) => requestedBaseFields.includes(field.name) || requestedBaseFields.includes("*"));
        for (const field of fields) {
            const key: keyof DataObject<any> = field.name as keyof DataObject<any>;
            result[entity][field.name] = field;
            if (field instanceof ManyToManyField || field instanceof CompositionField || field instanceof CollectionField || field instanceof ReferenceField) {
                let requestedSubFields: string[] = requestedFields
                    .filter((f: string) => f.startsWith(`${key}.`))
                    .map((f: string) => f.substr(f.indexOf(".") + 1));
                result = {
                    ...result,
                    ...this.getModelInternal(field.classGetter().name, requestedSubFields),
                };
            }
        }

        result[entity].id = new EntityField("id", "ID", EntityFieldType.UUID, true);

        return result;
    }

    public static getDisplayPatternFields(entity: string): EntityField[] {
        const object: DataObject<any> = Enemene.app.db.model(entity).build() as DataObject<any>;
        let fields: string[] = [];
        const matches: RegExpMatchArray | null = object.$displayPattern.match(/\{\w+\}/g);
        if (matches) {
            fields = matches.map((token: string) => token.replace(/[}{]/g, ""));
        }
        return Object.values(this.getModel(object.$entity, fields)[entity]);
    }
}
