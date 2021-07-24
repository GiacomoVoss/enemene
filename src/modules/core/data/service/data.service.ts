import {ObjectNotFoundError} from "../../error/object-not-found.error";
import {DataObject} from "../../model/data-object.model";
import {FindOptions} from "sequelize";
import {BeforeDeleteHook} from "../interface/before-delete-hook.interface";
import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUser} from "../../auth";
import {AbstractFilter, FilterService} from "../../filter";
import {DataFindOptions} from "../interface/data-find-options.interface";
import {ModelService} from "../../model/service/model.service";
import {VirtualObject} from "../../model";

/**
 * Service to retrieve data from the model.
 */
export class DataService {

    public async findAll<T extends DataObject<T>>(clazz: any, filter?: AbstractFilter, options?: DataFindOptions): Promise<T[]> {
        if (ModelService.isVirtualEntity(clazz)) {
            const provider: VirtualObject<any> = new clazz();
            return provider.findAll(filter, options);
        } else {
            return DataService.findAllRaw(clazz, {
                ...FilterService.toSequelize(filter, clazz),
                order: options?.order,
                limit: options?.limit,
            });
        }
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

    public async findByIdNotNull<ENTITY extends DataObject<ENTITY>>(clazz: any, id: string): Promise<ENTITY> {
        const object: ENTITY = await this.findById(clazz, id);
        if (!object) {
            throw new ObjectNotFoundError(clazz.name);
        }
        return object;
    }

    public async findById<ENTITY extends DataObject<ENTITY>>(clazz: any, id: string): Promise<ENTITY | undefined> {
        let object: ENTITY;
        if (ModelService.isVirtualEntity(clazz)) {
            const provider: VirtualObject<any> = new clazz();
            object = provider.findById(id);
        } else {
            object = await clazz.findByPk(id);
        }

        return object ?? undefined;
    }

    public static async findAllRaw<T extends DataObject<T>>(clazz: any, options: FindOptions = {}): Promise<T[]> {
        let objects: T[] = await clazz.findAll({
            ...options,
            limit: undefined,
            offset: undefined,
            nest: true,
        });
        if (options.limit) {
            const offset = options.offset ?? 0;
            objects = objects.slice(offset, offset + options.limit);
        }
        return objects;
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
        const object: ENTITY | null = await DataService.findById(clazz, id, options);
        if (object === null) {
            throw new ObjectNotFoundError(clazz.name);
        }
        return object;
    }


    public static async findById<ENTITY extends DataObject<ENTITY>>(clazz: any, id: number | string, options: FindOptions = {}): Promise<ENTITY | null> {
        const object: ENTITY = await clazz.findOne({
            ...options,
            where: {
                ...(options.where ?? {}),
                id,
            },
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
