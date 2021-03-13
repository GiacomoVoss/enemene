import {View, ViewFieldDefinition} from "..";
import {DataObject} from "../../model";
import {ConstructorOf} from "../../../../base/constructor-of";
import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUser} from "../../auth";

export interface ViewFieldConfiguration<SUBENTITY extends DataObject<SUBENTITY>, SUBVIEW extends View<SUBENTITY>> {
    position: number;
    description?: string | string[],
    calculated?: boolean;
    canUpdate?: boolean;
    canCreate?: boolean;
    canInsert?: boolean;
    canRemove?: boolean;
    default?: (context: RequestContext<AbstractUser>) => any,
    required?: boolean;
    subView?: ConstructorOf<SUBVIEW>;
    meta?: any;
}

export function ViewField<ENTITY extends DataObject<ENTITY>, SUBENTITY extends DataObject<SUBENTITY>, SUBVIEW extends View<SUBENTITY>>
(configurationOrPosition: number | ViewFieldConfiguration<SUBENTITY, SUBVIEW>): Function {
    return function (target: new () => View<ENTITY>, key: keyof ENTITY): void {
        const fieldType = Reflect.getMetadata("design:type", target, key as string);
        const fields: ViewFieldDefinition<ENTITY, SUBENTITY>[] = target.constructor.prototype.$fields ?? [];
        const configuration: ViewFieldConfiguration<SUBENTITY, SUBVIEW> = typeof configurationOrPosition === "number" ? {position: configurationOrPosition} : configurationOrPosition;
        target.constructor.prototype.$fields = [
            ...fields,
            new ViewFieldDefinition<ENTITY, SUBENTITY>(key as keyof View<ENTITY>, fieldType, configuration),
        ];
    };
}
