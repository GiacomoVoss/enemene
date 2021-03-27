import {uuid} from "../../base/type/uuid.type";
import {ConstructorOf} from "../../base/constructor-of";
import {AbstractCommand} from "./command";

export abstract class Aggregate {
    public id: uuid;
    public version: number;
    public deleted: boolean;

    constructor(id: uuid,
                version?: number,
                deleted?: boolean);
}

export declare function CommandHandler(commandType: ConstructorOf<AbstractCommand>): Function;