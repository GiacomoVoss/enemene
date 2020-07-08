import { DataObject } from "../../model/data-object.model";
import { EntityField } from "../../model/interface/entity-field.class";
import { ValidationErrorItem } from "@hapi/joi";
export declare const ValidationService: {
    validate: typeof validate;
    parseValidationMessages: typeof parseValidationMessages;
};
declare function validate<ENTITY extends DataObject<ENTITY>>(clazz: ENTITY, object: DataObject<ENTITY>): void;
declare function parseValidationMessages(messages: ValidationErrorItem[], fields: EntityField[]): string;
export {};
