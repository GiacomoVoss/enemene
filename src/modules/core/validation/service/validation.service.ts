import {DataObject} from "../../model/data-object.model";
import {DateService} from "../../service/date.service";
import {ModelService} from "../../model/service/model.service";
import {EntityField} from "../../model/interface/entity-field.class";
import {isEmpty} from "lodash";
import * as Joi from "@hapi/joi";
import {SchemaMap, ValidationErrorItem, ValidationOptions} from "@hapi/joi";
import {InputValidationError} from "../error/input-validation.error";

export const ValidationService = {
    validate,
    parseValidationMessages,
};

const validationOptions: ValidationOptions = {
    abortEarly: false,
    allowUnknown: true
};

function validate<ENTITY extends DataObject<ENTITY>>(clazz: ENTITY, object: DataObject<ENTITY>): void {
    const dataToValidate = {};

    let validationSchema: SchemaMap = {};
    let fields: EntityField[] = Object.values(ModelService.FIELDS[(clazz as any).name]);

    for (const field of fields) {
        if (field.required && !object[field.name]) {
            validationSchema[field.name] = Joi.required();
        }
    }

    if (!isEmpty(validationSchema)) {
        try {
            Joi.assert(dataToValidate, Joi.compile(validationSchema), validationOptions);
        } catch (e) {
            throw new InputValidationError(ValidationService.parseValidationMessages(e.details, fields));
        }
    }
}

function parseValidationMessages(messages: ValidationErrorItem[], fields: EntityField[]): string {
    return messages
        .map((errorItem: ValidationErrorItem) => {
            const field = fields.find((field: EntityField) => field.name === errorItem.context.key);
            return field.name + "::" + formatValidationMessage(errorItem, fields);
        })
        .join("\n");
}

function formatValidationMessage(errorItem: ValidationErrorItem, fields: EntityField[]): string {
    const field = fields.find((field: EntityField) => field.name === errorItem.context.key);
    const attribute: string = field ? field.label : errorItem.context.key;
    switch (errorItem.type) {
        case "any.empty":
        case "any.required":
            return `"${attribute}" darf nicht leer sein.`;

        case "date.min":
            const dateLimit: Date = new Date(errorItem.context.limit);
            return `"${attribute}" muss größer oder gleich ${DateService.formatDateTime(dateLimit)} sein.`;

        case "number.base":
            return `"${attribute}" muss eine Zahl sein."`;

        case "any.only":
            return `"${attribute}" muss gleich ${errorItem.context.valids.map((v: string) => `"${v}"`).join(" | ")} sein.`;
        default:
            return errorItem.message + "(" + errorItem.type + ")";
    }
}
