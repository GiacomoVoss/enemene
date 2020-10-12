import {EntityField} from "../interface/entity-field.class";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {merge, uniq} from "lodash";
import {DataObject} from "../data-object.model";
import {ManyToManyField} from "../interface/many-to-many-field.class";
import {CompositionField} from "../interface/composition-field.class";
import {CollectionField} from "../interface/collection-field.class";
import {ReferenceField} from "../interface/reference-field.class";
import {EntityFieldType} from "../enum/entity-field-type.enum";
import {EntityModel} from "../type/entity-model.type";
import {AbstractUser, DataResponse, DataService, Enemene} from "../../../..";
import {UnsupportedOperationError} from "../../error/unsupported-operation.error";

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
                result = merge(result, this.getModelInternal(field.classGetter().name, requestedSubFields));
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
        fields.push("id");
        return Object.values(this.getModel(entity, fields)[entity]);
    }

    public static async getAllowedValues<ENTITY extends DataObject<ENTITY>>(object: ENTITY,
                                                                            field: keyof ENTITY,
                                                                            user: AbstractUser): Promise<DataResponse<any[]>> {
        const fieldModel: EntityField = ModelService.getFields(object.$entity)[field as string];
        if (fieldModel.isSimpleField || fieldModel instanceof CompositionField) {
            throw new UnsupportedOperationError();
        }
        const allowedValuesMap: Dictionary<Function, keyof ENTITY> = object.$allowedValues;
        const allowedValuesFn: Function = allowedValuesMap[field];
        let data: DataObject<any>[];
        if (allowedValuesFn) {
            data = await allowedValuesFn.apply(object, user);
        }
        const fieldDataEntity: string = (fieldModel as ReferenceField).classGetter().name;
        const displayPatternFields: string[] = this.getDisplayPatternFields(fieldDataEntity).map((f: EntityField) => f.name);
        return {
            data: await Promise.all(data.map((d: DataObject<any>) => DataService.filterFields(d, displayPatternFields))),
            model: this.getModel(fieldDataEntity, displayPatternFields),
        };
    }
}
