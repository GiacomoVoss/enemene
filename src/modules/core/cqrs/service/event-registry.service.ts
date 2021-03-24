import {Enemene} from "../../application";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {ConstructorOf} from "../../../../base/constructor-of";
import {FileService} from "../../file/service/file.service";
import {AbstractEvent} from "../class/abstract-event.class";
import {Event} from "../entity/event.model";

export class EventRegistryService {

    private fileService: FileService = Enemene.app.inject(FileService);

    private events: Dictionary<ConstructorOf<AbstractEvent>> = {};

    async init(): Promise<void> {
        const eventFiles: string[] = this.fileService.scanForFilePattern(Enemene.app.config.modulesPath, /.*\.event\.js/);
        const eventModules: Dictionary<ConstructorOf<AbstractEvent>>[] = await Promise.all(eventFiles.map((filePath: string) => import(filePath)));

        const systemModules = await import("../event");

        [systemModules, ...eventModules].forEach((moduleMap: Dictionary<ConstructorOf<AbstractEvent>>) => {
            Object.values(moduleMap).forEach((event: ConstructorOf<AbstractEvent>) => {
                this.events[event.name] = event;
            });
        });
    }

    parseEvent(event: Event): AbstractEvent {
        const eventClass: ConstructorOf<AbstractEvent> = this.events[event.eventType];
        const eventObject: AbstractEvent = new eventClass();
        eventObject.populate(event.data);
        return eventObject;
    }
}