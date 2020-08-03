import {ObjectNotFoundError} from "../../error/object-not-found.error";
import {DataObject} from "../../model/data-object.model";
import {ValidationService} from "../../validation/service/validation.service";
import {Validate} from "../../validation/interface/validate.interface";
import {SchemaMap} from "@hapi/joi";
import {UnauthorizedError} from "../../auth/error/unauthorized.error";
import {CountOptions, FindOptions} from "sequelize";
import {UuidService} from "../../service/uuid.service";
import {ModelService} from "../../model/service/model.service";
import {EntityField} from "../../model/interface/entity-field.class";
import {isEqual, uniq} from "lodash";
import {CollectionField} from "../../model/interface/collection-field.class";
import {ReferenceField} from "../../model/interface/reference-field.class";
import {CompositionField} from "../../model/interface/composition-field.class";
import {ManyToManyField} from "../../model/interface/many-to-many-field.class";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {Enemene} from "../../application/enemene";

/**
 * Service to retrieve data from the model.
 */
export class DataService {
    /**
     * Counts the amount of objects of the given class based on the given options.
     * @param clazz     - The class of the objects.
     * @param options   - Optional sequelize IFindOptions.
     */
    public static async count<T extends DataObject<T>>(clazz: any, options?: FindOptions): Promise<number> {
        return Enemene.app.db.transaction(async t => {
            const countOptions: CountOptions = {
                include: [],
                distinct: true,
                transaction: t
            };
            if (Object.keys(clazz.rawAttributes).includes("id")) {
                countOptions.col = "id";
            }
            return clazz.count({
                ...options,
                ...countOptions
            });
        });
    }

    public static async findAll<T extends DataObject<T>>(clazz: any, options?: FindOptions): Promise<T[]> {
        let objects: T[] = [];
        await Enemene.app.db.transaction(async t => {
            objects = await clazz.findAll({
                ...options,
                nest: true,
                transaction: t
            });
        });
        return objects.map((object: T) => {
            object.$entity = clazz.name;
            return object;
        });
    }

    public static async findNotNull<ENTITY extends DataObject<ENTITY>>(clazz: any, options?: FindOptions): Promise<ENTITY> {
        return Enemene.app.db.transaction(async t => {
            const object: ENTITY = await clazz.findOne({
                ...options,
                transaction: t,
            });
            if (!object) {
                throw new ObjectNotFoundError(clazz.name);
            }
            object.$entity = clazz.name;
            return object;
        });
    }


    public static async findNotNullById<ENTITY extends DataObject<ENTITY>>(clazz: any, id: number | string, options?: FindOptions): Promise<ENTITY | null> {
        return Enemene.app.db.transaction(async t => {
            const object: ENTITY = await clazz.findByPk(id, {
                ...options,
                transaction: t,
            });
            if (!object) {
                throw new ObjectNotFoundError(clazz.name);
            }
            object.$entity = clazz.name;
            return object;
        });
    }

    /**
     * Updates an object. Applies validation if there is some.
     *
     * @param clazz
     * @param object            - The object to update.
     * @param data              - The data to populate the object with.
     * @param validationSchema  - (optional) Validation schema.
     */
    public static async update<T extends DataObject<T>>(clazz: any, object: Partial<DataObject<T>> | Validate, data: any, validationSchema?: SchemaMap): Promise<void> {
        await Enemene.app.db.transaction(async t => {
            delete data.id;
            (object as DataObject<T>).setAttributes(data);

            ValidationService.validate(clazz, object as DataObject<T>);

            await (object as DataObject<T>).save({transaction: t});
        });
    }

    /**
     * Creates an object with validation.
     *
     * @param clazz             - The class the object should be of.
     * @param data              - The data to populate the object with.
     * @param [validationSchema]- Validation schema.
     * @param [filter]          - Filter that the created object has to meet.
     */
    public static async create<T extends DataObject<T>>(clazz: any, data: Dictionary<serializable>, validationSchema?: SchemaMap, filter?: any): Promise<T> {
        let object: T = null;

        await Enemene.app.db.transaction(async t => {
            data.id = UuidService.getUuid();
            data.$entity = clazz.name;
            object = await DataService.populate(data);

            ValidationService.validate(clazz, object as DataObject<T>);

            await (object as DataObject<T>).save({transaction: t});

            if (filter) {
                const where = {};
                clazz.primaryKeyAttributes.forEach(attribute => where[attribute] = object[attribute]);
                const found = await clazz.count({
                    where: {
                        ...where,
                        ...filter
                    },
                    transaction: t
                });

                if (found != 1) {
                    throw new UnauthorizedError();
                }
            }
        });
        return object;
    }

    public static async populate<T extends DataObject<T>>(data: Dictionary<any>): Promise<T> {
        const object: T = Enemene.app.db.model(data.$entity).build({
            id: data.id,
        }, {
            isNewRecord: true,
        }) as T;
        const fields: Dictionary<EntityField, keyof T> = ModelService.getFields(data.$entity);
        for (const [key, field] of Object.entries(fields)) {
            if (data[key]) {
                if (field instanceof CompositionField) {
                    const subObjectData: Dictionary<any> = data[key];
                    if (subObjectData.id) {
                        const subObject = await DataService.findNotNullById(field.classGetter(), subObjectData.id);
                        await DataService.update(field.classGetter(), subObject, subObjectData);
                    } else {
                        const subObject = await DataService.create(field.classGetter(), subObjectData);
                        object.$set(key as keyof T, subObject);
                    }
                } else if (field instanceof ReferenceField) {
                    const referenceObject = await DataService.findNotNullById(field.classGetter(), data[key]);
                    object[field.foreignKey as keyof T] = referenceObject.id as any;
                } else if (field instanceof CollectionField) {
                    throw new Error("Cannot save collections directly.");
                } else {
                    object[key as keyof T] = data[key];
                }
            }
        }

        return object;
    }

    public static async filterFields<ENTITY extends DataObject<ENTITY>>(object: ENTITY, requestedFields: string[]): Promise<Dictionary<any, keyof ENTITY>> {
        const result: any = {};
        const requestedBaseFields: string[] = uniq(requestedFields.map((field: string) => field.replace(/\..*/, "")));
        const fields: EntityField[] = Object.values(ModelService.FIELDS[object.$entity])
            .filter((field: EntityField) => requestedBaseFields.includes(field.name) || requestedBaseFields.includes("*"));
        for (const field of fields) {
            const key: keyof DataObject<any> = field.name as keyof DataObject<any>;
            let value = object[key];
            if (field instanceof ManyToManyField || field instanceof CompositionField || field instanceof CollectionField || field instanceof ReferenceField) {
                let requestedSubFields: string[] = requestedFields
                    .filter((f: string) => f.startsWith(`${key}.`))
                    .map((f: string) => f.substr(f.indexOf(".") + 1));
                if (!requestedSubFields.length) {
                    requestedSubFields = ModelService.getDisplayPatternFields(field.classGetter().name).map(f => f.name);
                }

                if (isEqual(requestedSubFields, ["$count"])) {
                    // Only object count requested.
                    result[`${key}.$count`] = await object.$count(key);
                } else {
                    // Also values requested.
                    if (!value) {
                        value = await object.$get(key) as any;
                    }

                    if (!value) {
                        result[key] = null;
                    } else if (field instanceof ManyToManyField || field instanceof CollectionField) {
                        if (requestedSubFields.includes("$count")) {
                            result[`${key}.$count`] = value.length;
                        }
                        result[key] = await Promise.all((value as DataObject<any>[]).map(v => this.filterFields(v, requestedSubFields)));
                    } else if (field instanceof CompositionField || field instanceof ReferenceField) {
                        result[key] = await this.filterFields(value as DataObject<any>, requestedSubFields);
                    }
                }

            } else {
                result[key] = value ?? null;
            }
        }

        result.id = object.id;
        result.$entity = object.$entity;
        result.$displayPattern = object.$displayPattern;

        return result;
    }
}
