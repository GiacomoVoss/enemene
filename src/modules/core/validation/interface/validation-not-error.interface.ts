import {ValidationError} from "../interface/validation-error.interface";

export interface ValidationNotError extends ValidationError {

    type: "not";

    validationError: ValidationError;
}
