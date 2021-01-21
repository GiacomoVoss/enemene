export declare type Dictionary<VALUE, KEY extends string | number | symbol = string> = Partial<Record<KEY, VALUE>>;

export declare interface ConstructorOf<CLASS> {
    new(...args: any[]): CLASS;
}

export declare type uuid = string;

export declare type serializable = string | number | boolean | Date | object | string[] | number[] | boolean[] | Date[] | object[] | null;