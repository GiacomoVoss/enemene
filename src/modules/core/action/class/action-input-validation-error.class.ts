import {ValidationError} from "../../validation/interface/validation-error.interface";

export class ActionInputValidationError extends ValidationError {

    constructor(public field: string,
                public message: string = "input") {
        super();
    }
}