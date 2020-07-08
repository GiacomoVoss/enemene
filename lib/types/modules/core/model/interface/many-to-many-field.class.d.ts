import { EntityField } from "./entity-field.class";
export declare class ManyToManyField extends EntityField {
    name: string;
    label: string;
    classGetter: () => any;
    throughGetter: () => any;
    constructor(name: string, label: string, classGetter: () => any, throughGetter: () => any);
    toJSON(): any;
}
