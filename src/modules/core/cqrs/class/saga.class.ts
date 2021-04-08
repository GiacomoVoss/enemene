import {CommandHandlerDefinition} from "../interface/command-handler-definition.interface";
import {EventHandlerDefinition} from "../interface/event-handler-definition.interface";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {EnemeneCqrs} from "../../application";
import {ObjectRepositoryService} from "../service/object-repository.service";
import {CommandBus} from "../service/command-bus.service";

export abstract class Saga {

    $commandHandlers: CommandHandlerDefinition[];
    $eventHandlers: Dictionary<EventHandlerDefinition>;

    protected objectRepository: ObjectRepositoryService = EnemeneCqrs.app.inject(ObjectRepositoryService);
    protected commandBus: CommandBus = EnemeneCqrs.app.inject(CommandBus);

    constructor() {
    }
}