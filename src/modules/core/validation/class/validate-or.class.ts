import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {AbstractValidate} from "./abstract-validate.class";
import {ValidationResult} from "../type/validation-result.type";
import {ValidationError} from "../interface/validation-error.interface";

export class ValidateOr extends AbstractValidate {
    constructor(private args: AbstractValidate[]) {
        super();
    }

    public evaluate(object: Dictionary<serializable>): ValidationResult {
        const errorResults: ValidationResult[] = this.args
            .map(arg => arg.evaluate(object))
            .filter(argResult => argResult !== true);
        if (errorResults.length < this.args.length) {
            return true;
        }

        return [new ValidationOrError(errorResults)];
    }
}

export class ValidationOrError extends ValidationError {
    constructor(public validationErrors: ValidationError[]) {
        super();
    }
}
