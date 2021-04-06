import {AbstractValidate} from "./abstract-validate.class";
import {ValidationResult} from "../type/validation-result.type";
import {Validate} from "./validate.class";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {CommandInputValidationError} from "../../cqrs/error/command-input-validation.error";
import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUserReadModel} from "../../../../types/cqrs";
import {I18nService} from "../../i18n/service/i18n.service";
import {ValidationFieldError} from "../interface/validation-field-error.interface";

export class ValidateCommandInput extends AbstractValidate {
    constructor(private fields: Dictionary<string | string[]>) {
        super();
    }

    public evaluate(object: any, context?: RequestContext<AbstractUserReadModel>): ValidationResult {
        const result: ValidationResult[] = Object.entries(this.fields).map(([field, labels]) => {
            if (Validate.exists(field).evaluate(object) !== true) {
                return new ValidationFieldError(field, CommandInputValidationError.REQUIRED, I18nService.getI18nizedString(labels, context?.language));
            }
            return true;
        })
            .filter(result => result !== true);
        if (!result.length) {
            return true;
        }

        return result;
    }
}