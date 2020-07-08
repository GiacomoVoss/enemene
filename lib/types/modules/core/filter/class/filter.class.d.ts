export declare class Filter {
    name: string;
    args: Filter[];
    parameters: any[];
    constructor(name: string, args?: Filter[], parameters?: any[]);
    static and(...args: Filter[]): Filter;
    static or(...args: Filter[]): Filter;
    static not(arg: Filter): Filter;
    static equals(field: string, value: string | number): Filter;
    static exists(entity: string, field: string, arg?: Filter): Filter;
}
