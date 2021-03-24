import {uuid} from "../../base/type/uuid.type";

export abstract class Aggregate {
    public id: uuid;
    public version: number;
    public deleted: boolean;

    constructor(id: uuid,
                version?: number,
                deleted?: boolean);
}