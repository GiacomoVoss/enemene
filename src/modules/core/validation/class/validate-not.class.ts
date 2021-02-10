import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {AbstractValidate} from "./abstract-validate.class";
import {ValidationResult} from "../type/validation-result.type";
import {ValidationError} from "../interface/validation-error.interface";

export class ValidateNot extends AbstractValidate {
    constructor(private arg: AbstractValidate) {
        super();
    }

    public evaluate(object: Dictionary<serializable>): ValidationResult {
        const result: ValidationResult = this.arg.evaluate(object);
        if (result === true) {
            return [new ValidationNotError(result)];
        } else {
            return true;
        }
    }
}

export class ValidationNotError extends ValidationError {
    constructor(public validationError: ValidationError) {
        super();
    }
}
