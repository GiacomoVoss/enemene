import {uuid} from "../../../../base/type/uuid.type";
import {CommandHandlerDefinition} from "../interface/command-handler-definition.interface";
import {EventHandlerDefinition} from "../interface/event-handler-definition.interface";

export abstract class Aggregate {

    $commandHandlers: CommandHandlerDefinition[];
    $eventHandlers: EventHandlerDefinition[];

    constructor(public id: uuid,
                public version: number = 0,
                public deleted: boolean = false) {
    }

    async build(): Promise<void> {

    }
}