import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {AbstractValidate} from "./abstract-validate.class";
import {ValidationResult} from "../type/validation-result.type";
import {get, isEqual} from "lodash";
import {ValidationFieldError} from "../interface/validation-field-error.interface";

export class ValidateEquals extends AbstractValidate {
    constructor(private field: string,
                private value: any) {
        super();
    }

    public evaluate(object: Dictionary<serializable>): ValidationResult {
        const value: any = get(object, this.field, undefined);
        if (isEqual(this.value, value)) {
            return true;
        } else {
            return [new ValidationFieldError(this.field, "equals")];
        }
    }
}