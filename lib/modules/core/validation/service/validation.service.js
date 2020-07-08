"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationService = void 0;
const date_service_1 = require("../../service/date.service");
const model_service_1 = require("../../model/service/model.service");
const lodash_1 = require("lodash");
const Joi = __importStar(require("@hapi/joi"));
const input_validation_error_1 = require("../error/input-validation.error");
exports.ValidationService = {
    validate,
    parseValidationMessages,
};
const validationOptions = {
    abortEarly: false,
    allowUnknown: true
};
function validate(clazz, object) {
    const dataToValidate = {};
    let validationSchema = {};
    let fields = Object.values(model_service_1.ModelService.FIELDS[clazz.name]);
    for (const field of fields) {
        if (field.required && !object[field.name]) {
            validationSchema[field.name] = Joi.required();
        }
    }
    if (!lodash_1.isEmpty(validationSchema)) {
        try {
            Joi.assert(dataToValidate, Joi.compile(validationSchema), validationOptions);
        }
        catch (e) {
            throw new input_validation_error_1.InputValidationError(exports.ValidationService.parseValidationMessages(e.details, fields));
        }
    }
}
function parseValidationMessages(messages, fields) {
    return messages
        .map((errorItem) => {
        const field = fields.find((field) => field.name === errorItem.context.key);
        return field.name + "::" + formatValidationMessage(errorItem, fields);
    })
        .join("\n");
}
function formatValidationMessage(errorItem, fields) {
    const field = fields.find((field) => field.name === errorItem.context.key);
    const attribute = field ? field.label : errorItem.context.key;
    switch (errorItem.type) {
        case "any.empty":
        case "any.required":
            return `"${attribute}" darf nicht leer sein.`;
        case "date.min":
            const dateLimit = new Date(errorItem.context.limit);
            return `"${attribute}" muss größer oder gleich ${date_service_1.DateService.formatDateTime(dateLimit)} sein.`;
        case "number.base":
            return `"${attribute}" muss eine Zahl sein."`;
        case "any.only":
            return `"${attribute}" muss gleich ${errorItem.context.valids.map((v) => `"${v}"`).join(" | ")} sein.`;
        default:
            return errorItem.message + "(" + errorItem.type + ")";
    }
}
//# sourceMappingURL=validation.service.js.map