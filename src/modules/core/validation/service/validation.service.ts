import {DataObject} from "../../model/data-object.model";
import {ValidationResult} from "../type/validation-result.type";
import {InputValidationError} from "../error/input-validation.error";
import {ModelService} from "../../model/service/model.service";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {EntityField} from "../../model/interface/entity-field.class";
import {AbstractValidate} from "../class/abstract-validate.class";
import {serializable} from "../../../../base/type/serializable.type";
import {ValidationError} from "../interface/validation-error.interface";
import {ValidationFieldError} from "../interface/validation-field-error.interface";
import {I18nService} from "../../i18n/service/i18n.service";
import {ValidationNotError} from "../class/validate-not.class";
import {ValidationOrError} from "../class/validate-or.class";
import {View} from "../../view";
import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUser} from "../../auth";

export class ValidationService {

    public validateView<ENTITY extends DataObject<ENTITY>>(view: View<ENTITY>, context: RequestContext<AbstractUser>): void {
        this.validate(view.toJSON(), view.$view.entity.name, context.language, view.$view.getValidation());
    }

    public validate<ENTITY extends DataObject<ENTITY>>(object: Dictionary<serializable>, entity: string, language: string, validation?: AbstractValidate): void {
        let result: ValidationResult;

        if (validation) {
            result = validation.evaluate(object);
        } else {
            result = true;
        }

        if (result !== true) {
            if (!Array.isArray(result)) {
                result = [result];
            }
            throw new InputValidationError(this.addI18nLabels(result as ValidationError[], ModelService.getFields(entity), language), entity, language);
        }
    }

    private addI18nLabels<ENTITY extends DataObject<ENTITY>>(errors: ValidationError[], model: Dictionary<EntityField, keyof ENTITY>, language: string): ValidationError[] {
        return errors.map(error => this.addI18nLabel(error, model, language));
    }

    private addI18nLabel<ENTITY extends DataObject<ENTITY>>(error: ValidationError, model: Dictionary<EntityField, keyof ENTITY>, language: string): ValidationError {
        if (error instanceof ValidationFieldError) {
            const field: EntityField = model[error.field];
            error.i18nLabel = I18nService.getI18nizedString(field.label, language);
        } else if (error instanceof ValidationNotError) {
            error.validationError = this.addI18nLabel(error.validationError, model, language);
        } else if (error instanceof ValidationOrError) {
            error.validationErrors = error.validationErrors.map(orError => this.addI18nLabel(orError, model, language));
        }
        return error;
    }
}
