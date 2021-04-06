import {uuid} from "../../../../base/type/uuid.type";
import {CommandHandlerDefinition} from "../interface/command-handler-definition.interface";
import {EventHandlerDefinition} from "../interface/event-handler-definition.interface";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {AbstractCommand} from "./abstract-command.class";
import {defaults, isEqual, pick} from "lodash";
import {Event} from "../entity/event.model";
import {AbstractEvent} from "./abstract-event.class";
import {EnemeneCqrs} from "../../application";
import {EventRegistryService} from "../service/event-registry.service";
import {ObjectRepositoryService} from "../service/object-repository.service";

export abstract class Aggregate {

    $commandHandlers: CommandHandlerDefinition[];
    $eventHandlers: Dictionary<EventHandlerDefinition>;

    protected objectRepository: ObjectRepositoryService = EnemeneCqrs.app.inject(ObjectRepositoryService);

    constructor(public id: uuid,
                public version: number = 0,
                public deleted: boolean = false) {
    }

    protected isEqual(command: AbstractCommand, ...fields: string[]): boolean {
        return isEqual(defaults(pick(command, ...fields), pick(this, ...fields)), pick(this, ...fields));
        // return fields.reduce((result: boolean, field: string) => {
        //     return result && ((command.$semanticType === SemanticCommandType.UPDATE && command[field] === undefined) || this[field] === command[field]);
        // }, true);
    }

    public handleEvent(metadata: Event) {
        if (metadata.position > this.version) {
            const event: AbstractEvent = EnemeneCqrs.app.inject(EventRegistryService).parseEvent(metadata);
            const handler: EventHandlerDefinition = this.$eventHandlers[metadata.eventType];
            if (handler) {
                handler.handler.apply(this, [event, metadata]);
            }
            this.version++;
        }
    }
}