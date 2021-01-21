import {View, ViewFieldDefinition} from "..";
import {DataObject} from "../../model";
import {ConstructorOf} from "../../../../base/constructor-of";


export function ViewField<ENTITY extends DataObject<ENTITY>, SUBENTITY extends DataObject<SUBENTITY>, SUBVIEW extends View<SUBENTITY>>(position: number, subView?: ConstructorOf<SUBVIEW>, meta?: any): Function {
    return function (target: new () => View<ENTITY>, key: keyof ENTITY): void {
        const fields: ViewFieldDefinition<ENTITY, SUBENTITY>[] = target.constructor.prototype.$fields ?? [];
        const fieldType = Reflect.getMetadata("design:type", target, key as string);
        target.constructor.prototype.$fields = [
            ...fields,
            new ViewFieldDefinition<ENTITY, SUBENTITY>(key as keyof View<ENTITY>, position, fieldType, subView, fieldType.name === "Array", meta),
        ];
    };
}
