import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {AbstractValidate} from "./abstract-validate.class";
import {ValidationResult} from "../type/validation-result.type";

export class ValidateAnd extends AbstractValidate {
    constructor(private args: AbstractValidate[]) {
        super();
    }

    public evaluate(object: Dictionary<serializable>): ValidationResult {
        return this.args
            .map(arg => arg.evaluate(object))
            .filter(argResult => argResult !== true)
            .reduce((result: ValidationResult, argResult: ValidationResult) => {
                if (result === true) {
                    result = [argResult];
                } else if (Array.isArray(result)) {
                    result.push(argResult);
                } else {
                    result = [result, argResult];
                }
                return result;
            }, true);
    }
}