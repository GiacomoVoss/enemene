import { Model } from "sequelize-typescript";
import { JsonDefinition } from "./type/json-definition.type";
import { BuildOptions } from "sequelize";
import { Dictionary } from "../../../base/type/dictionary.type";
/**
 * Basic abstract entity model.
 */
export declare class DataObject<E> extends Model<DataObject<E>> {
    $entity: string;
    $displayPattern: string;
    id: string;
    /**
     * Contains the definition for turning this object into JSON.
     */
    jsonDefinition?: JsonDefinition;
    constructor(values?: Dictionary<any, keyof E>, options?: BuildOptions);
    /**
     * Turns the object into JSON based on the {@link jsonDefinition}.
     */
    toJSON(): any;
}
