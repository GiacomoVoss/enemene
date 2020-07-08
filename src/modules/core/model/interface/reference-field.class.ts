import {EntityField} from "./entity-field.class";
import {EntityFieldType} from "../enum/entity-field-type.enum";

export class ReferenceField extends EntityField {
    constructor(public name: string,
                public label: string,
                public classGetter: () => any,
                public foreignKey: string,
                public required: boolean) {
        super(name, label, EntityFieldType.REFERENCE, required);
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            class: this.classGetter().name,
            foreignKey: this.foreignKey,
        };
    }
}
