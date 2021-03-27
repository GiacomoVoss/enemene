import {AbstractValidate} from "../validation";

export declare abstract class AbstractCommand {

    abstract $endpoint: string;

    constructor(validation?: AbstractValidate);
}

export enum SemanticCommandType {
    DEFAULT = "DEFAULT",
    CREATE = "CREATE",
    RESTORE = "RESTORE",
    UPDATE = "UPDATE"
}

export declare function SemanticCommand(type: SemanticCommandType): Function;

export declare class CommandBus {

    executeCommand(command: AbstractCommand, aggregateId: string): Promise<void>;
}