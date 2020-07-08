import { EntityField } from "./entity-field.class";
export declare class ReferenceField extends EntityField {
    name: string;
    label: string;
    classGetter: () => any;
    foreignKey: string;
    required: boolean;
    constructor(name: string, label: string, classGetter: () => any, foreignKey: string, required: boolean);
    toJSON(): any;
}
