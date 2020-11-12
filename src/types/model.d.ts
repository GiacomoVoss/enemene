import {Model} from "sequelize-typescript";
import {ConstructorOf, Dictionary, serializable} from "./base";
import {BuildOptions, FindOptions, ModelAttributeColumnOptions, Order} from "sequelize";
import {AbstractFilter} from "./filter";
import {RequestContext} from "./controller";
import {AbstractUser} from "./auth";

export declare class DataObject<E> extends Model<DataObject<E>> {
    $entity: string;
    $displayPattern: string;

    id: string;

    constructor(values?: Dictionary<any, keyof E>, options?: BuildOptions);
}

export declare function Entity(target: new () => DataObject<any>): void;

export declare function Field(label: string | string[],
                              type?: EntityFieldType,
                              required?: boolean,
                              options?: Partial<ModelAttributeColumnOptions>): Function;

export declare function Calculated(label: string | string[],
                                   type?: EntityFieldType,
                                   includeFields?: string[]): Function;

export declare function Collection(label: string | string[],
                                   classGetter: () => ConstructorOf<DataObject<any>>,
                                   foreignKey: string,
                                   composition?: boolean): Function;

export function Composition(label: string | string[],
                            classGetter: () => ConstructorOf<DataObject<any>>,
                            required?: boolean): Function;

export declare function Reference(label: string | string[],
                                  classGetter: () => ConstructorOf<DataObject<any>>,
                                  required?: boolean): Function;

export declare function AllowedValues<ENTITY extends DataObject<ENTITY>>(attribute: keyof ENTITY): Function;

export declare namespace EntityFieldType {
    export const STRING = "STRING";
    export const PASSWORD = "PASSWORD";
    export const TEXT = "TEXT";
    export const UUID = "UUID";
    export const EMAIL = "EMAIL";
    export const DATE = "DATE";
    export const STRING_ARRAY = "STRING_ARRAY";
    export const NUMBER = "NUMBER";
    export const BOOLEAN = "BOOLEAN";
    export const REFERENCE = "REFERENCE";
    export const COMPOSITION = "COMPOSITION";
    export const COLLECTION = "COLLECTION";
    export const OBJECT = "OBJECT";
    export const CALCULATED = "CALCULATED";
    export const ENUM: (values: any) => string[];
}

export declare type EntityFieldType = string | string[];

export declare class DataService {
    public findAll<T extends DataObject<T>>(clazz: any, filter?: AbstractFilter, options?: DataFindOptions): Promise<T[]>;

    public findByIdNotNull<ENTITY extends DataObject<ENTITY>>(clazz: any, id: number | string): Promise<ENTITY>;

    public findOneNotNull<ENTITY extends DataObject<ENTITY>>(clazz: any, filter?: AbstractFilter): Promise<ENTITY>;

    public create<T extends DataObject<T>>(clazz: any,
                                           data: Dictionary<serializable>,
                                           context: RequestContext<AbstractUser>,
                                           options?: FindOptions): Promise<T>;

    public bulkCreate<T extends DataObject<T>>(clazz: any, data: Dictionary<serializable>[]): Promise<T[]>
}

export interface DataFindOptions {
    order?: Order;
    limit?: number;
}

