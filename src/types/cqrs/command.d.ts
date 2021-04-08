import {AbstractValidate} from "../validation";
import {uuid} from "../../base/type/uuid.type";
import {RequestContext} from "../../modules/core/router/interface/request-context.interface";
import {AbstractUserReadModel} from "../../modules/core/auth";
import {RuntimeError} from "../error";

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

    public executeCommand(command: AbstractCommand, aggregateId: string, aggregateVersion?: number, context?: RequestContext<AbstractUserReadModel>): void;
}

export interface CommandExecution<C extends AbstractCommand> {
    command: C;
    aggregateId: uuid;
}

export interface CommandResult {
    value?: any;
}

export class UserInputValidationError extends RuntimeError {

    statusCode: 400;

    constructor(message: string);
}