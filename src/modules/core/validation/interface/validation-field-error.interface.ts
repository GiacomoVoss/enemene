import {ValidationError} from "../interface/validation-error.interface";

export class ValidationFieldError extends ValidationError {

    constructor(public field: string,
                public message: string,
                public i18nLabel?: string) {
        super();
    }
}