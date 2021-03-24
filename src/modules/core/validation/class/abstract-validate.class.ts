import {ValidationResult} from "../type/validation-result.type";

export abstract class AbstractValidate {

    public abstract evaluate(object: any): ValidationResult;
}
