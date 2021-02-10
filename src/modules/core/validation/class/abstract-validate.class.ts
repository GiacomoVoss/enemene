import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {ValidationResult} from "../type/validation-result.type";

export abstract class AbstractValidate {

    public abstract evaluate(object: Dictionary<serializable>): ValidationResult;
}
