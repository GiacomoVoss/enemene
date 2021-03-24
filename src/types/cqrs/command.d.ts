import {ConstructorOf} from "../../base/constructor-of";

export abstract class AbstractCommand {

    abstract $endpoint: string;
}

export declare function CommandHandler(commandType: ConstructorOf<AbstractCommand>): Function;


export declare class CommandBus {

    executeCommand(command: AbstractCommand, aggregateId: string): Promise<void>;
}