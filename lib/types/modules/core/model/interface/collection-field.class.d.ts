import { EntityField } from "./entity-field.class";
export declare class CollectionField extends EntityField {
    name: string;
    label: string;
    classGetter: () => any;
    foreignKey: string;
    constructor(name: string, label: string, classGetter: () => any, foreignKey: string);
    toJSON(): any;
}
