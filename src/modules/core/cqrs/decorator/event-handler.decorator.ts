import {ConstructorOf} from "../../../../base/constructor-of";
import {ReadModel} from "../class/read-model.class";
import {EventHandlerDefinition} from "../interface/event-handler-definition.interface";
import {AbstractEvent} from "../class/abstract-event.class";
import {uuid} from "../../../../base/type/uuid.type";

export function EventHandler<T extends AbstractEvent>(eventType: ConstructorOf<T>, global: boolean = false, idExtractor?: (event: T) => uuid): Function {
    return function (target: ConstructorOf<ReadModel>, key: string, descriptor: PropertyDescriptor): void {
        const handlers: EventHandlerDefinition[] = target.constructor.prototype.$eventHandlers || [];

        handlers.push({
            eventTypeName: eventType.name,
            handler: descriptor.value,
            global,
            idExtractor,
        });

        target.constructor.prototype.$eventHandlers = handlers;
    };
}