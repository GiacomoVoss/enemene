import {EntityFieldType, FieldDefinition, FieldType} from "./questions";

export function fieldAnnotationHelper(field: FieldDefinition) {
    switch (field.fieldType) {
        case FieldType.Field:
            return `@Field("${field.label}", EntityFieldType.${field.dataType}${field.required ? ", true" : ""})`;
        case FieldType.Reference:
            return `@Reference("${field.label}", () => ${field.dataType}${field.required ? ", true" : ""})`;
        case FieldType.Collection:
            return `@Collection("${field.label}", () => ${field.dataType}, "${field.foreignKey}")`;
        case FieldType.Composition:
            return `@Composition("${field.label}", () => ${field.dataType}${field.required ? ", true" : ""})`;
        case FieldType.ManyToMany:
            return `@ManyToMany("${field.label}", () => ${field.dataType}, () => ${field.throughType})`;
        default:
            return "@NotImplementedYet";
    }
}

export function typescriptTypeForEntityFieldType(field: FieldDefinition) {
    switch (field.dataType) {
        case EntityFieldType.BOOLEAN:
            return "boolean";
        case EntityFieldType.COLLECTION:
        case EntityFieldType.COMPOSITION:
        case EntityFieldType.REFERENCE:
            return field.dataType;
        case EntityFieldType.EMAIL:
            return "string";
        case EntityFieldType.NUMBER:
            return "number";
        case EntityFieldType.STRING:
            return "string";
        case EntityFieldType.STRING_ARRAY:
            return "string[]";
        case EntityFieldType.UUID:
            return "uuid";
    }
    return "unknown";
}

export function isPluralFieldHelper(field: FieldDefinition) {
    return [FieldType.Collection, FieldType.ManyToMany].includes(field.fieldType);
}
