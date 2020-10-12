import {PathDefinition} from "../../auth/interface/path-definition.interface";
import {View, ViewFieldDefinition} from "..";
import {ConstructorOf} from "../../../../base/constructor-of";
import {DataObject} from "../../model";

export function ViewField<ENTITY extends DataObject<ENTITY>>(position: number, subView?: ConstructorOf<View<any>>): Function {
    return function (target: new () => View<ENTITY>, key: keyof View<ENTITY>, descriptor: PropertyDescriptor): void {
        const fields: PathDefinition[] = target.constructor.prototype.$fields || [];

        target.constructor.prototype.$fields = [
            ...fields,
            new ViewFieldDefinition(key, position, subView),
        ];
    };
}
