import {AbstractFilter} from "../../filter";
import {VirtualObject} from "../../model/class/virtual-object.model";
import {ConstructorOf} from "../../../../base/constructor-of";

export class VirtualObjectService {

    public async findAll<E extends VirtualObject<E>>(clazz: ConstructorOf<E>, filter?: AbstractFilter): Promise<E[]> {
        const objects: E[] = await clazz.prototype.getObjects();
        if (filter) {
            return objects.filter(object => filter.evaluate(object.toJSON()));
        } else {
            return objects;
        }
    }
}