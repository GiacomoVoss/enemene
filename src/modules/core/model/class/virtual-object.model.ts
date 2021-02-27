import {DataObject} from "../data-object.model";
import {Model} from "sequelize";
import {InitOptions, ModelAttributes} from "sequelize/types/lib/model";
import {AbstractFilter} from "../../filter";
import {DataFindOptions} from "../../data/interface/data-find-options.interface";
import {uuid} from "../../../../base/type/uuid.type";
import {ModelService} from "../service/model.service";

export abstract class VirtualObject<E extends VirtualObject<any>> extends DataObject<E> {

    public static $isVirtual: boolean = true;
    $displayPattern: string = "{id}";

    abstract id: uuid;

    private objectsCache: E[] | undefined = undefined;

    constructor(values?: any) {
        super(values);
    }

    private getObjectsCache(): E[] {
        if (!this.objectsCache) {
            this.objectsCache = this.getObjects();
        }
        return this.objectsCache;
    }

    public static init<E extends Model>(
        this: any,
        attributes: ModelAttributes<E, E["_attributes"]>, options: InitOptions<E>
    ): Model {
        this.prototype.$entity = options.modelName;
        this.prototype._initValues = () => {
        };
        this.attributes = attributes;
        this.prototype.$isVirtual = true;
        ModelService.VIRTUAL_MODELS[this.name] = this;
        return undefined;
    }

    protected abstract getObjects(): E[];

    public findAll(filter?: AbstractFilter, options?: DataFindOptions): E[] {
        let objects: E[] = this.getObjectsCache();
        if (filter) {
            objects = objects.filter(o => filter.evaluate(o.toJSON()));
        }

        return objects;
    }

    public findById(id: uuid): E {
        const objects: E[] = this.getObjectsCache();
        return objects.find(o => o.id === id) ?? null;
    }

    public toJSON(): any {
        return {
            ...this,
            $displayPattern: this.$displayPattern,
            $entity: this.$entity,
        };
    }
}