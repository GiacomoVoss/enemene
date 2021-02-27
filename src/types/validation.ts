import {serializable} from "./base";
import {Dictionary} from "../base/type/dictionary.type";

export type ValidationResult = true | ValidationError[];

export declare class ValidationError {
}

export abstract class AbstractValidate {

    public abstract evaluate(object: Dictionary<serializable>): ValidationResult;
}

export declare class Validate {

    public static and(...args: AbstractValidate[]): AbstractValidate;

    public static or(...args: AbstractValidate[]): AbstractValidate;

    public static not(arg: AbstractValidate): AbstractValidate;

    public static equals(field: string, value: serializable): AbstractValidate;

    public static exists(field: string): AbstractValidate;
}