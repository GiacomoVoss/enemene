import {Event} from "../entity/event.model";
import {AbstractEvent} from "../class/abstract-event.class";
import {uuid} from "../../../../base/type/uuid.type";

export interface EventHandlerDefinition {
    eventTypeName: string;
    handler: (event: Event) => void;
    global: boolean;

    idExtractor?: (event: AbstractEvent) => uuid;
}