import {Dictionary} from "../../../../base/type/dictionary.type";
import {ConstructorOf} from "../../../../base/constructor-of";
import {AbstractEvent} from "../class/abstract-event.class";
import {Event} from "../entity/event.model";
import {FileRegistryService} from "../../service/file-registry.service";

export class EventRegistryService extends FileRegistryService {

    private events: Dictionary<ConstructorOf<AbstractEvent>> = {};

    async init(): Promise<void> {
        (await this.loadFiles(/.*\.event\.js/, await import("../event"))).forEach((event: ConstructorOf<AbstractEvent>) => {
            this.events[event.name] = event;
        });
    }

    parseEvent(event: Event): AbstractEvent {
        const eventClass: ConstructorOf<AbstractEvent> = this.events[event.eventType];
        const eventObject: AbstractEvent = new eventClass();
        eventObject.populate(event.data);
        return eventObject;
    }
}