import {ValidationError} from "../interface/validation-error.interface";

export interface ValidationOrError extends ValidationError {
    type: "or";

    validationErrors: ValidationError[];
}
