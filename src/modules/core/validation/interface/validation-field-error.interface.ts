import {ValidationError} from "../interface/validation-error.interface";

export class ValidationFieldError extends ValidationError {

    public i18nLabel: string;

    constructor(public field: string,
                public message: string) {
        super();
    }
}