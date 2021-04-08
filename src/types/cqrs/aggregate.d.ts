import {uuid} from "../../base/type/uuid.type";
import {ConstructorOf} from "../../base/constructor-of";
import {AbstractCommand} from "./command";
import {ObjectRepositoryService} from ".";

export abstract class Aggregate {
    public id: uuid;
    public version: number;
    public deleted: boolean;

    protected objectRepository: ObjectRepositoryService;

    constructor(id: uuid,
                version?: number,
                deleted?: boolean);

    protected isEqual(command: AbstractCommand, ...fields: string[]): boolean;
}

export declare function CommandHandler(commandType: ConstructorOf<AbstractCommand>, isPublic?: boolean): Function;