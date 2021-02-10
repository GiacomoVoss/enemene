import {serializable} from "./base";

export abstract class AbstractValidation {
}

export declare class Validate {

    public static and(...args: AbstractValidation[]): AbstractValidation;

    public static or(...args: AbstractValidation[]): AbstractValidation;

    public static not(arg: AbstractValidation): AbstractValidation;

    public static equals(field: string, value: serializable): AbstractValidation;

    public static exists(field: string): AbstractValidation;
}