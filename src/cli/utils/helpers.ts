import {FieldDefinition, FieldType} from "./questions";

export function fieldAnnotationHelper(field: FieldDefinition) {
    switch (field.fieldType) {
        case FieldType.Field:
            return `@Field("${field.label}", ${field.dataType})`;
        case FieldType.Reference:
            return `@Reference("${field.label}", () => ${field.dataType})`;
        case FieldType.Collection:
            return `@Collection("${field.label}", () => ${field.dataType}, "${field.foreignKey}")`;
        case FieldType.Composition:
            return `@Composition("${field.label}", () => ${field.dataType})`;
        case FieldType.ManyToMany:
            return `@ManyToMany("${field.label}", () => ${field.dataType}, () => ${field.throughType})`;
        default:
            return "@NotImplementedYet";
    }
}

export function isPluralFieldHelper(field: FieldDefinition) {
    return [FieldType.Collection, FieldType.ManyToMany].includes(field.fieldType);
}
