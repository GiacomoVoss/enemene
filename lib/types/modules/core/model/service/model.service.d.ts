import { EntityField } from "../interface/entity-field.class";
import { Dictionary } from "../../../../base/type/dictionary.type";
export declare class ModelService {
    static FIELDS: Dictionary<Dictionary<EntityField>>;
    static getFields<T>(entity: string): Dictionary<EntityField, keyof T>;
    static getModel(entity: string, requestedFields: string[]): Dictionary<Dictionary<EntityField> | string>;
    private static getModelInternal;
    static getDisplayPatternFields(entity: string): EntityField[];
}
