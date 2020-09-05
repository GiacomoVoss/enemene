import {DataObject} from "../../model/data-object.model";
import {Validate} from "../class/validate.class";
import {ValidationResult} from "../type/validation-result.type";
import {ValidationError} from "../interface/validation-error.interface";
import {get} from "lodash";
import {InputValidationError} from "../error/input-validation.error";
import {ModelService} from "../../model/service/model.service";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {EntityField} from "../../model/interface/entity-field.class";
import {ValidationFieldError} from "../interface/validation-field-error.interface";
import {ValidationNotError} from "../interface/validation-not-error.interface";
import {ValidationOrError} from "../interface/validation-or-error.interface";
import {I18nService} from "../../i18n/service/i18n.service";

export class ValidationService {

    public static validate<ENTITY extends DataObject<ENTITY>>(object: DataObject<ENTITY>, validation?: Validate, language?: string): void {
        const fields: Dictionary<EntityField, keyof ENTITY> = ModelService.getFields(object.$entity);
        const requiredFields: string[] = Object.values(fields)
            .filter((field: EntityField) => field.required)
            .map((field: EntityField) => field.name);

        const compositeValidations: Validate[] = [];

        if (validation) {
            compositeValidations.push(validation);
        }

        if (requiredFields.length) {
            compositeValidations.push(...requiredFields.map(Validate.exists));
        }

        let result;

        if (compositeValidations.length) {
            result = this.validateInternal(object, Validate.and(...compositeValidations), language);
        } else {
            result = true;
        }

        if (result !== true) {
            throw new InputValidationError(result);
        }
    }

    private static validateInternal<ENTITY extends DataObject<ENTITY>>(object: DataObject<ENTITY>, validation: Validate, language?: string): ValidationResult {
        const model: Dictionary<EntityField> = ModelService.getFields(object.$entity);
        const errors: ValidationError[] = [];
        if (validation.name === "and") {
            (validation.args.map((arg: Validate) => this.validateInternal(object, arg, language))
                .filter((result: ValidationResult) => result !== true) as ValidationError[])
                .forEach((errorResults: ValidationError[]) => {
                    errors.push(...errorResults);
                });
        } else if (validation.name === "or") {
            const orResults: ValidationResult[] = [];
            let fulfilled = false;
            for (const arg of validation.args) {
                const result: ValidationResult = this.validateInternal(object, arg, language);
                if (result === true) {
                    fulfilled = true;
                    break;
                } else {
                    orResults.push(result);
                }
            }
            if (!fulfilled) {
                errors.push({
                    type: "or",
                    validationErrors: orResults,
                } as ValidationOrError);
            }
        } else if (validation.name === "not") {
            const result: ValidationResult = this.validateInternal(object, validation.args[0], language);
            if (result === true) {
                errors.push({
                    type: "not",
                    validationError: result,
                } as ValidationNotError);
            }
        } else if (validation.name === "exists") {
            const value = get(object, validation.parameters[0]);
            if (value === undefined || value === null || (typeof value === "string" && value.length === 0)) {
                errors.push({
                    type: "field",
                    field: validation.parameters[0],
                    message: "required",
                    label: I18nService.getI18nizedString(model[validation.parameters[0]].label, language),
                } as ValidationFieldError);
            }
        }

        if (!errors.length) {
            return true;
        } else {
            return errors;
        }
    }
}
