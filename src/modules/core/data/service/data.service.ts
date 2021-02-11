import {ObjectNotFoundError} from "../../error/object-not-found.error";
import {DataObject} from "../../model/data-object.model";
import {FindOptions} from "sequelize";
import {Enemene} from "../../application/enemene";
import {BeforeDeleteHook} from "../interface/before-delete-hook.interface";
import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUser} from "../../auth";
import {AbstractFilter, FilterService} from "../../filter";
import {DataFindOptions} from "../interface/data-find-options.interface";

/**
 * Service to retrieve data from the model.
 */
export class DataService {

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


    public static async findNotNullById<ENTITY extends DataObject<ENTITY>>(clazz: any, id: number | string, options?: FindOptions): Promise<ENTITY> {
        const object: ENTITY = await clazz.findByPk(id, {
            ...options,
        });
        if (!object) {
            throw new ObjectNotFoundError(clazz.name);
        }
        return object;
    }


    public static async findById<ENTITY extends DataObject<ENTITY>>(clazz: any, id: number | string, options: FindOptions = {}): Promise<ENTITY | null> {
        const object: ENTITY = await clazz.findByPk(id, {
            ...options,
        });
        if (!object) {
            return null;
        }
        return object;
    }

    public static async delete<T extends DataObject<T>>(object: DataObject<T>, context: RequestContext<AbstractUser>): Promise<void> {
        if ((object as unknown as BeforeDeleteHook).onBeforeDelete) {
            await (object as unknown as BeforeDeleteHook).onBeforeDelete(context);
        }
        await object.destroy({transaction: context.transaction});
    }
}
