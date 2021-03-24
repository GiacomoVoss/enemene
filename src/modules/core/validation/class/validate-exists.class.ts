import {AbstractValidate} from "./abstract-validate.class";
import {ValidationResult} from "../type/validation-result.type";
import {get} from "lodash";
import {ValidationFieldError} from "../interface/validation-field-error.interface";

export class ValidateExists extends AbstractValidate {
    constructor(private field: string,
                private arg?: AbstractValidate) {
        super();
    }

    public evaluate(object: any): ValidationResult {
        const value: string | object | undefined = get(object, this.field, undefined) as string | object | undefined;
        if (value === undefined || value === null || (typeof value === "string" && value.length === 0)) {
            return new ValidationFieldError(this.field, "required");
        }
        if (this.arg && typeof value === "object") {
            return this.arg.evaluate(value);
        }

        return true;
    }
}