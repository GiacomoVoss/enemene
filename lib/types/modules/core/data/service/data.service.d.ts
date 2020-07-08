import { DataObject } from "../../model/data-object.model";
import { Validate } from "../../validation/interface/validate.interface";
import { SchemaMap } from "@hapi/joi";
import { FindOptions } from "sequelize";
import { Dictionary } from "../../../../base/type/dictionary.type";
import { serializable } from "../../../../base/type/serializable.type";
/**
 * Service to retrieve data from the model.
 */
export declare class DataService {
    /**
     * Counts the amount of objects of the given class based on the given options.
     * @param clazz     - The class of the objects.
     * @param options   - Optional sequelize IFindOptions.
     */
    static count<T extends DataObject<T>>(clazz: any, options?: FindOptions): Promise<number>;
    static findAll<T extends DataObject<T>>(clazz: any, options?: FindOptions): Promise<T[]>;
    static findNotNull<ENTITY extends DataObject<ENTITY>>(clazz: any, options?: FindOptions): Promise<ENTITY>;
    static findNotNullById<ENTITY extends DataObject<ENTITY>>(clazz: any, id: number | string, options?: FindOptions): Promise<ENTITY | null>;
    /**
     * Updates an object. Applies validation if there is some.
     *
     * @param clazz
     * @param object            - The object to update.
     * @param data              - The data to populate the object with.
     * @param validationSchema  - (optional) Validation schema.
     */
    static update<T extends DataObject<T>>(clazz: any, object: Partial<DataObject<T>> | Validate, data: any, validationSchema?: SchemaMap): Promise<void>;
    /**
     * Creates an object with validation.
     *
     * @param clazz             - The class the object should be of.
     * @param data              - The data to populate the object with.
     * @param [validationSchema]- Validation schema.
     * @param [filter]          - Filter that the created object has to meet.
     */
    static create<T extends DataObject<T>>(clazz: any, data: Dictionary<serializable>, validationSchema?: SchemaMap, filter?: any): Promise<T>;
    static populate<T extends DataObject<T>>(data: Dictionary<any>): Promise<T>;
    static filterFields<ENTITY extends DataObject<ENTITY>>(object: ENTITY, requestedFields: string[]): Promise<Dictionary<any, keyof ENTITY>>;
}
