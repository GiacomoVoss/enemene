import {serializable} from "./base";
import {Dictionary} from "../base/type/dictionary.type";

export abstract class AbstractFilter {
    public abstract evaluate(object: Dictionary<serializable>): boolean;
}

export declare class Filter {

    public static and(...args: AbstractFilter[]): AbstractFilter;

    public static or(...args: AbstractFilter[]): AbstractFilter;

    public static not(arg: AbstractFilter): AbstractFilter;

    public static equals(field: string, value: serializable): AbstractFilter;

    public static greaterOrEqual(field: string, value: number | Date): AbstractFilter;

    public static lessOrEqual(field: string, value: number | Date): AbstractFilter;
    
    public static exists(field: string, arg?: AbstractFilter): AbstractFilter;

    public static like(field: string, value: string): AbstractFilter;

    public static in(field: string, value: string[]): AbstractFilter;

    public static true(): AbstractFilter;
}
