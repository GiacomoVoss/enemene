export namespace EntityFieldType {
    export const STRING = "STRING";
    export const PASSWORD = "PASSWORD";
    export const TEXT = "TEXT";
    export const UUID = "UUID";
    export const EMAIL = "EMAIL";
    export const DATE = "DATE";
    export const STRING_ARRAY = "STRING_ARRAY";
    export const NUMBER = "NUMBER";
    export const BOOLEAN = "BOOLEAN";
    export const REFERENCE = "REFERENCE";
    export const COMPOSITION = "COMPOSITION";
    export const COLLECTION = "COLLECTION";
    export const ENUM = (values): string[] => {
        return Object.values(values);
    };
}

export type EntityFieldType = string | string[];
