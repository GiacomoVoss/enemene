import { EntityFieldType } from "../enum/entity-field-type.enum";
export declare class EntityField {
    name: string;
    label: string;
    type: EntityFieldType;
    required: boolean;
    constructor(name: string, label: string, type: EntityFieldType, required: boolean);
    toJSON(): any;
}
