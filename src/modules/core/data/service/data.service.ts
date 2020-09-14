import {ObjectNotFoundError} from "../../error/object-not-found.error";
import {DataObject} from "../../model/data-object.model";
import {ValidationService} from "../../validation/service/validation.service";
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
import {OrderItem} from "sequelize/types/lib/model";
import {uuid} from "../../../../base/type/uuid.type";
import {AfterCreateHook, BeforeCreateHook} from "..";
import {Validate} from "../../validation/class/validate.class";
import {RuntimeError} from "../../application/error/runtime.error";

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
        const countOptions: CountOptions = {
            col: "id",
            distinct: true,
        };
        return clazz.count({
            ...options,
            ...countOptions
        });
    }

    public static async findAll<T extends DataObject<T>>(clazz: any, options: FindOptions = {}): Promise<T[]> {
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
        const object: ENTITY = await clazz.findOne({
            ...options,
        });
        if (!object) {
            throw new ObjectNotFoundError(clazz.name);
        }
        object.$entity = clazz.name;
        return object;
    }

    public static async find<ENTITY extends DataObject<ENTITY>>(clazz: any, options?: FindOptions): Promise<ENTITY> {
        const object: ENTITY = await clazz.findOne({
            ...options,
        });
        if (!object) {
            return null;
        }
        object.$entity = clazz.name;
        return object;
    }


    public static async findNotNullById<ENTITY extends DataObject<ENTITY>>(clazz: any, id: number | string, options?: FindOptions): Promise<ENTITY> {
        const object: ENTITY = await clazz.findByPk(id, {
            ...options,
        });
        if (!object) {
            throw new ObjectNotFoundError(clazz.name);
        }
        object.$entity = clazz.name;
        return object;
    }


    public static async findById<ENTITY extends DataObject<ENTITY>>(clazz: any, id: number | string, options?: FindOptions): Promise<ENTITY | null> {
        const object: ENTITY = await clazz.findByPk(id, {
            ...options,
        });
        if (!object) {
            return null;
        }
        object.$entity = clazz.name;
        return object;
    }

    /**
     * Updates an object. Applies validation if there is some.
     *
     * @param clazz
     * @param object            - The object to update.
     * @param data              - The data to populate the object with.
     * @param validation  - (optional) Validation schema.
     */
    public static async update<T extends DataObject<T>>(clazz: any, object: DataObject<T>, data: any, validation?: Validate): Promise<void> {
        await Enemene.app.db.transaction(async t => {
            data.$entity = clazz.name;
            object = await DataService.populate(data, object);

            ValidationService.validate(object, validation);

            await object.save({transaction: t});
        });
    }

    /**
     * Creates an object with validation.
     *
     * @param clazz             - The class the object should be of.
     * @param data              - The data to populate the object with.
     * @param [validation]      - Validation schema.
     * @param [options]         - Filter that the created object has to meet.
     */
    public static async create<T extends DataObject<T>>(clazz: any, data: Dictionary<serializable>, validation?: Validate, options: FindOptions = {}): Promise<T> {
        let object: T = null;

        await Enemene.app.db.transaction(async t => {
            data.$entity = clazz.name;
            object = await DataService.populate(data);

            ValidationService.validate(object as DataObject<T>, validation);

            if ((object as unknown as BeforeCreateHook).onBeforeCreate) {
                await (object as unknown as BeforeCreateHook).onBeforeCreate();
            }

            await (object as DataObject<T>).save({transaction: t});

            if (options.where) {
                const where = {};
                clazz.primaryKeyAttributes.forEach(attribute => where[attribute] = object[attribute]);
                const found = await clazz.count({
                    where: {
                        ...where,
                        ...(options.where ?? {})
                    },
                    transaction: t
                });

                if (found != 1) {
                    throw new UnauthorizedError();
                }
            }

            if ((object as unknown as AfterCreateHook).onAfterCreate) {
                await (object as unknown as AfterCreateHook).onAfterCreate();
            }
        });
        return this.findById(clazz, object.id as uuid);
    }

    /**
     * Creates multiple objects with validation.
     *
     * @param clazz             - The class the object should be of.
     * @param data              - The data to populate the objects with.
     * @param [validation]      - Validation schema.
     * @param [filter]          - Filter that the created object has to meet.
     */
    public static async bulkCreate<T extends DataObject<T>>(clazz: any, data: Dictionary<serializable>[], validation?: Validate, filter?: any): Promise<T[]> {
        let objects: T[] = [];
        await Enemene.app.db.transaction(async t => {
            let dataObjects: Dictionary<serializable>[] = [];
            for (const dataObject of data) {
                dataObject.id = UuidService.getUuid();
                dataObject.$entity = clazz.name;
                const object: T = await DataService.populate(dataObject);
                ValidationService.validate(object, validation);
                dataObjects.push(dataObject);
            }

            objects = await clazz.bulkCreate(dataObjects, {transaction: t});

            if (filter) {
                const where = {};
                clazz.primaryKeyAttributes.forEach(attribute => where[attribute] = objects[0][attribute]);
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
        return objects;
    }

    public static getFindOptions(order?: string, limit?: string, offset?: string): FindOptions {
        const findOptions: FindOptions = {};

        if (order) {
            let ordersArray: OrderItem[] = order.split(",").map((orderToken: string) => {
                let orderArray: string[] = orderToken.split(":");
                if (orderArray.length === 1) {
                    orderArray.push("ASC");
                } else if (orderArray.length > 2) {
                    orderArray = orderArray.slice(0, 2);
                }
                if (orderArray.length === 2) {
                    return orderArray as OrderItem;
                }

                return undefined;
            })
                .filter(orderArray => !!orderArray);
            if (ordersArray.length) {
                findOptions.order = ordersArray;
            }
        }
        if (limit && !isNaN(parseInt(limit))) {
            findOptions.limit = parseInt(limit);
        }

        if (offset && !isNaN(parseInt(offset))) {
            findOptions.offset = parseInt(offset);
        }

        return findOptions;
    }

    public static async populate<T extends DataObject<T>>(data: Dictionary<any>, originalData?: T, t?: any): Promise<T> {
        let object: T;
        if (originalData) {
            object = originalData;
        } else {
            object = Enemene.app.db.model(data.$entity).build({
                id: UuidService.getUuid(),
                $entity: data.$entity,
            }, {
                isNewRecord: true,
            }) as T;
        }
        const fields: Dictionary<EntityField, keyof T> = ModelService.getFields(data.$entity);
        for (const [key, field] of Object.entries(fields)) {
            if (field instanceof CompositionField) {
                const subObjectData: Dictionary<any> = data[key] ?? data[field.foreignKey] ?? originalData?.[key] ?? originalData?.[field.foreignKey];
                if (subObjectData) {
                    if (subObjectData.id) {
                        const subObject: DataObject<any> = await DataService.findNotNullById(field.classGetter(), subObjectData.id);
                        await DataService.update(field.classGetter(), subObject, subObjectData);
                        object[field.foreignKey] = subObjectData.id;
                    } else {
                        const subObject = await DataService.create(field.classGetter(), subObjectData);
                        object.$set(key as keyof T, subObject);
                        object[field.foreignKey] = subObject.id;
                    }
                }
            } else if (field instanceof ReferenceField) {
                const subObjectId: uuid = data[key] ?? data[field.foreignKey] ?? originalData?.[key] ?? originalData?.[field.foreignKey];
                if (subObjectId) {
                    const referenceObject = await DataService.findNotNullById(field.classGetter(), subObjectId);
                    object[field.foreignKey as keyof T] = referenceObject.id as any;
                    object[key as keyof T] = referenceObject as any;
                }
            } else if (field instanceof CollectionField && data[key]) {
                throw new RuntimeError("Cannot save collections directly.");
            } else if (data[key] !== undefined) {
                object[key as keyof T] = data[key];
            }
        }

        return object;
    }

    public static async filterFields<ENTITY extends DataObject<ENTITY>>(object: ENTITY, filterFields: string[]): Promise<Dictionary<any, keyof ENTITY>> {
        const result: any = {};
        const requestedBaseFields: string[] = uniq(filterFields.map((field: string) => field.replace(/\..*/, "")));
        const fields: EntityField[] = Object.values(ModelService.FIELDS[object.$entity])
            .filter((field: EntityField) => requestedBaseFields.includes(field.name) || requestedBaseFields.includes("*"));
        for (const field of fields) {
            const key: keyof DataObject<any> = field.name as keyof DataObject<any>;
            let value = object[key];
            if (field instanceof ManyToManyField || field instanceof CompositionField || field instanceof CollectionField || field instanceof ReferenceField) {
                let requestedSubFields: string[] = filterFields
                    .filter((f: string) => f.startsWith(`${key}.`))
                    .map((f: string) => f.substr(f.indexOf(".") + 1));
                if (!requestedSubFields.length) {
                    requestedSubFields = ModelService.getDisplayPatternFields(field.classGetter().name).map(f => f.name);
                }

                if (isEqual(requestedSubFields, ["$count"])) {
                    // Only object count requested.
                    result[`${key}.$count`] = object[key]?.length ?? 0;
                } else {
                    // Also values requested.
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
