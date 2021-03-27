import {ConstructorOf} from "../../../../base/constructor-of";
import {ReadModel} from "../class/read-model.class";
import {EventHandlerDefinition} from "../interface/event-handler-definition.interface";
import {AbstractEvent} from "../class/abstract-event.class";
import {uuid} from "../../../../base/type/uuid.type";
import {Dictionary} from "../../../../base/type/dictionary.type";

export function EventHandler<T extends AbstractEvent>(eventType: ConstructorOf<T>, idExtractorOrGlobal?: ((event: T) => uuid) | true): Function {
    return function (target: ConstructorOf<ReadModel>, key: string, descriptor: PropertyDescriptor): void {
        const handlers: Dictionary<EventHandlerDefinition> = target.constructor.prototype.$eventHandlers || {};

        handlers[eventType.name] = {
            eventTypeName: eventType.name,
            handler: descriptor.value,
            global: typeof idExtractorOrGlobal === "boolean" && idExtractorOrGlobal === true,
            idExtractor: !!idExtractorOrGlobal && typeof idExtractorOrGlobal === "function" ? idExtractorOrGlobal : undefined,
        };

        target.constructor.prototype.$eventHandlers = handlers;
    };
}