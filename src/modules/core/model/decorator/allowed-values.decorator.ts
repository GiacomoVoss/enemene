import {DataObject} from "../data-object.model";
import {Dictionary} from "../../../../base/type/dictionary.type";

export function AllowedValues<ENTITY extends DataObject<ENTITY>>(attribute: keyof ENTITY): Function {
    return (target: ENTITY, propertyKey: string, descriptor: PropertyDescriptor): void => {
        const allowedValues: Dictionary<Function, keyof ENTITY> = target.constructor.prototype.$allowedValues ?? {};

        allowedValues[attribute] = descriptor.value;

        target.constructor.prototype.$allowedValues = allowedValues;
    };
}