import {ConstructorOf, uuid} from "../base";
import {AbstractFilter} from "../../modules/core/filter";

export declare class ReadModel {

    public id: uuid;
    public deleted: boolean;

    protected resolveObjectReference<READMODEL extends ReadModel>(clazz: ConstructorOf<READMODEL>, id: uuid): READMODEL;
}

export declare function ReadEndpoint(target: ConstructorOf<ReadModel>): void;


export declare class ObjectRepositoryService {

    public getObject<T extends ReadModel>(readModel: ConstructorOf<T>, id: uuid, includeDeleted?: boolean): T | null;

    public getObjects<T extends ReadModel>(readModel: ConstructorOf<T>, filter?: AbstractFilter, includeDeleted?: boolean): T[];

    public getOrCreateObject<T extends ReadModel>(name: string | ConstructorOf<T>, id: uuid): T;
}