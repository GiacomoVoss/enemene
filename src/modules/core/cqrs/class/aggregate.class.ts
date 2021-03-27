import {uuid} from "../../../../base/type/uuid.type";
import {CommandHandlerDefinition} from "../interface/command-handler-definition.interface";
import {EventHandlerDefinition} from "../interface/event-handler-definition.interface";
import {Dictionary} from "../../../../base/type/dictionary.type";

export abstract class Aggregate {

    $commandHandlers: CommandHandlerDefinition[];
    $eventHandlers: Dictionary<EventHandlerDefinition>;

    constructor(public id: uuid,
                public version: number = 0,
                public deleted: boolean = false) {
    }
}