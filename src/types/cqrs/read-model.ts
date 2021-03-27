import {ConstructorOf, uuid} from "../base";

export declare abstract class ReadModel {

    public id: uuid;
    public deleted: boolean;
}


export declare class ReadModelRepositoryService {

    public getOrCreateObject<T extends ReadModel>(name: string | ConstructorOf<T>, id: uuid): T;
}