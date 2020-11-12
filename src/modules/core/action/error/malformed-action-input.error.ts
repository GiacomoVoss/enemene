import {InputValidationError} from "../../validation/error/input-validation.error";

export class MalformedActionInput extends InputValidationError {

    type: string = "MalformedActionInput";
}
