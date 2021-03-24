import {AbstractCommand} from "../class/abstract-command.class";
import {AbstractEvent} from "../class/abstract-event.class";

export interface CommandHandlerDefinition {
    endpoint: string;
    handler: (command: AbstractCommand) => Promise<AbstractEvent | AbstractEvent[] | null>;
}