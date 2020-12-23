import {ObjectNotFoundError} from "../../error/object-not-found.error";
import {DataObject} from "../../model/data-object.model";
import {ValidationService} from "../../validation/service/validation.service";
import {UnauthorizedError} from "../../auth/error/unauthorized.error";
import {CountOptions, FindOptions} from "sequelize";
import {UuidService} from "../../service/uuid.service";
import {ModelService} from "../../model/service/model.service";
import {EntityField} from "../../model/interface/entity-field.class";
import {CollectionField} from "../../model/interface/collection-field.class";
import {ReferenceField} from "../../model/interface/reference-field.class";
import {CompositionField} from "../../model/interface/composition-field.class";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {Enemene} from "../../application/enemene";
import {OrderItem} from "sequelize/types/lib/model";
import {uuid} from "../../../../base/type/uuid.type";
import {AfterCreateHook, BeforeCreateHook} from "..";
import {Validate} from "../../validation/class/validate.class";
import {BeforeDeleteHook} from "../interface/before-delete-hook.interface";
import {Transaction} from "sequelize/types/lib/transaction";
import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUser} from "../../auth";
import {isEmpty} from "lodash";
import {AbstractFilter, FilterService} from "../../filter";
import {DataFindOptions} from "../interface/data-find-options.interface";

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
        };
        return clazz.count({
            where: options.where,
            ...countOptions
        });
    }

    public async findAll<T extends DataObject<T>>(clazz: any, filter?: AbstractFilter, options?: DataFindOptions): Promise<T[]> {
        return DataService.findAllRaw(clazz, {
            ...FilterService.toSequelize(filter, clazz),
            order: options?.order,
            limit: options?.limit,
        });
    }

    public async findOneNotNull<ENTITY extends DataObject<ENTITY>>(clazz: any, filter?: AbstractFilter): Promise<ENTITY> {
        const object: ENTITY | undefined = await this.findOne(clazz, filter);
        if (!object) {
            throw new ObjectNotFoundError(clazz.name);
        }
        return object;
    }

    public async findOne<ENTITY extends DataObject<ENTITY>>(clazz: any, filter?: AbstractFilter): Promise<ENTITY | undefined> {
        const objects: ENTITY[] = await this.findAll(clazz, filter);
        if (objects.length !== 1) {
            return undefined;
        }
        return objects[0];
    }

    public async findByIdNotNull<ENTITY extends DataObject<ENTITY>>(clazz: any, id: number | string): Promise<ENTITY> {
        const object: ENTITY = await this.findById(clazz, id);
        if (!object) {
            throw new ObjectNotFoundError(clazz.name);
        }
        return object;
    }

    public async findById<ENTITY extends DataObject<ENTITY>>(clazz: any, id: number | string): Promise<ENTITY | undefined> {
        const object: ENTITY = await clazz.findByPk(id);
        return object ?? undefined;
    }

    public static async findAllRaw<T extends DataObject<T>>(clazz: any, options: FindOptions = {}): Promise<T[]> {
        let objects: T[] = [];
        await Enemene.app.db.transaction(async t => {
            objects = await clazz.findAll({
                ...options,
                limit: undefined,
                offset: undefined,
                nest: true,
                transaction: t
            });
        });
        if (options.limit) {
            const offset = options.offset ?? 0;
            objects = objects.slice(offset, offset + options.limit);
        }
        return objects.map((object: T) => {
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
        return object;
    }

    public static async find<ENTITY extends DataObject<ENTITY>>(clazz: any, options?: FindOptions): Promise<ENTITY> {
        const object: ENTITY = await clazz.findOne({
            ...options,
        });
        if (!object) {
            return null;
        }
        return object;
    }


    public static async findNotNullById<ENTITY extends DataObject<ENTITY>>(clazz: any, id: number | string, options?: FindOptions, transaction?: Transaction): Promise<ENTITY> {
        const object: ENTITY = await clazz.findByPk(id, {
            ...options,
            transaction,
        });
        if (!object) {
            throw new ObjectNotFoundError(clazz.name);
        }
        return object;
    }


    public static async findById<ENTITY extends DataObject<ENTITY>>(clazz: any, id: number | string, options?: FindOptions, transaction?: Transaction): Promise<ENTITY | null> {
        const object: ENTITY = await clazz.findByPk(id, {
            ...options,
            transaction,
        });
        if (!object) {
            return null;
        }
        return object;
    }

    /**
     * Updates an object. Applies validation if there is some.
     *
     * @param clazz
     * @param object            - The object to update.
     * @param data              - The data to populate the object with.
     * @param context           - Current request context.
     * @param transaction       - The transaction to execute the update in.
     */
    public static async update<T extends DataObject<T>>(clazz: any, object: DataObject<T>, data: any, context: RequestContext<AbstractUser>, transaction?: Transaction): Promise<DataObject<T>> {
        const t: Transaction = transaction ?? await Enemene.app.db.transaction();
        try {
            object = await DataService.populate(data, t, context, object);
            ValidationService.validate(object);
            await object.save({transaction: t});
            if (!transaction) {
                await t.commit();
            }
            return object;
        } catch (e) {
            if (!transaction) {
                await t.rollback();
            }
            throw e;
        }
    }

    public static async delete<T extends DataObject<T>>(object: DataObject<T>, context: RequestContext<AbstractUser>, transaction?: Transaction): Promise<void> {

        const t = transaction ?? await Enemene.app.db.transaction();
        try {
            if ((object as unknown as BeforeDeleteHook).onBeforeDelete) {
                await (object as unknown as BeforeDeleteHook).onBeforeDelete(context);
            }

            const entityFields: EntityField[] = Object.values(ModelService.MODEL[object.$entity]);
            await Promise.all(entityFields
                .filter((field: EntityField) => field.type === "COMPOSITION")
                .map(async (field: CompositionField) => {
                    const subObject: DataObject<any> = object[field.name] ?? await DataService.findById(field.classGetter(), object[field.foreignKey], undefined, t);
                    if (subObject) {
                        await DataService.delete(subObject, context, t);
                    }
                })
            );
            await object.destroy({transaction: t});
            if (!transaction) {
                await t.commit();
            }
        } catch (e) {
            if (!transaction) {
                await t.rollback();
            }
            throw e;
        }
    }

    public async create<T extends DataObject<T>>(clazz: any,
                                                 data: Dictionary<serializable>,
                                                 context: RequestContext<AbstractUser>,
                                                 options: FindOptions = {}): Promise<T> {
        return DataService.create(clazz, data, context, options);
    }

    public static async create<T extends DataObject<T>>(clazz: any,
                                                        data: Dictionary<serializable>,
                                                        context: RequestContext<AbstractUser>,
                                                        options: FindOptions = {},
                                                        transaction?: Transaction): Promise<T> {
        let object: T = null;
        const t = transaction ?? await Enemene.app.db.transaction();
        try {
            object = await DataService.populate({
                ...data,
                $entity: clazz.name,
            }, t);

            ValidationService.validate(object as DataObject<T>);

            if ((object as unknown as BeforeCreateHook).onBeforeCreate) {
                await (object as unknown as BeforeCreateHook).onBeforeCreate(context);
            }

            await (object as DataObject<T>).save({transaction: t});


            const where = {};
            if (options.where) {
                clazz.primaryKeyAttributes.forEach(attribute => where[attribute] = object[attribute]);
            }
            const newObject: T = await this.findById(clazz, object.id as uuid, {
                where: {
                    ...where,
                    ...(options.where ?? {})
                },
            }, t);

            if (!newObject) {
                throw new UnauthorizedError();
            }

            if ((object as unknown as AfterCreateHook).onAfterCreate) {
                await (object as unknown as AfterCreateHook).onAfterCreate(context);
            }

            if (!transaction) {
                await t.commit();
            }
            return newObject;
        } catch (e) {
            if (!transaction) {
                await t.rollback();
            }
            throw e;
        }
    }

    public async bulkCreate<T extends DataObject<T>>(clazz: any, data: Dictionary<serializable>[]): Promise<T[]> {
        return DataService.bulkCreate(clazz, data);
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
                const object: T = await DataService.populate({
                    ...dataObject,
                    $entity: clazz.name,
                }, t);
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
                    transaction: t,
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

    public static async populate<T extends DataObject<T>>(data: Dictionary<any>, transaction: Transaction, context?: RequestContext<AbstractUser>, originalData?: T): Promise<T> {
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
                    if (typeof subObjectData === "object" && !isEmpty(subObjectData)) {
                        // We got an object, check if the object exists or we need to create a new one.
                        if (subObjectData.id) {
                            let subObject: DataObject<any> = await DataService.findNotNullById(field.classGetter(), subObjectData.id, undefined, transaction);
                            subObject = await DataService.update(field.classGetter(), subObject, subObjectData, context, transaction);
                            object[field.foreignKey] = subObjectData.id;
                            object[field.name] = subObjectData;
                        } else {
                            const subObject = await DataService.create(field.classGetter(), subObjectData, context, undefined, transaction);
                            object[field.foreignKey] = subObject.id;
                            object[field.name] = subObject;
                        }
                    } else if (typeof subObjectData === "string") {
                        object[field.foreignKey] = subObjectData;
                        object[field.name] = await DataService.findNotNullById(field.classGetter(), subObjectData, undefined, transaction);
                    }
                }
            } else if (field instanceof ReferenceField) {
                const subObjectData: uuid | Dictionary<serializable> = data[key] ?? data[field.foreignKey] ?? originalData?.[key] ?? originalData?.[field.foreignKey];
                if (subObjectData) {
                    if (typeof subObjectData === "string") {
                        const referenceObject = await DataService.findNotNullById(field.classGetter(), subObjectData, undefined, transaction);
                        object[field.foreignKey as keyof T] = referenceObject.id as any;
                        object[key as keyof T] = referenceObject as any;
                    } else {
                        const referenceObject = await DataService.findNotNullById(field.classGetter(), subObjectData.id as string, undefined, transaction);
                        object[field.foreignKey as keyof T] = referenceObject.id as any;
                        object[key as keyof T] = referenceObject as any;
                    }
                }
            } else if (field instanceof CollectionField && data[key]) {
                console.log(data[key]);
                object[key as keyof T] = await Promise.all(data[key].map(async d => {
                    const collectionObject = await DataService.populate(d, transaction, context, originalData);
                })) as any;
            } else if (data[key] !== undefined) {
                object[key as keyof T] = data[key];
            }
        }

        return object;
    }
}
