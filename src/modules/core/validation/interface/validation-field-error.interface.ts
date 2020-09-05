import {ValidationError} from "../interface/validation-error.interface";

export interface ValidationFieldError extends ValidationError {

    type: "field";

    field: string;

    message: string,

    label: string;
}
