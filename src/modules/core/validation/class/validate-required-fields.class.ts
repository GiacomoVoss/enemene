import {AbstractValidate} from "./abstract-validate.class";
import {ValidationResult} from "../type/validation-result.type";
import {Validate} from "./validate.class";

export class ValidateRequiredFields extends AbstractValidate {
    constructor(private fields: string[]) {
        super();
    }

    public evaluate(object: any): ValidationResult {
        return Validate.and(
            ...this.fields.map(Validate.exists)
        ).evaluate(object);
    }
}