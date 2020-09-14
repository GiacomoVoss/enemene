import {EntityField} from "./entity-field.class";
import {EntityFieldType} from "../enum/entity-field-type.enum";

export class ManyToManyField extends EntityField {
    constructor(public name: string,
                public label: string | string[],
                public classGetter: () => any,
                public throughGetter: () => any) {
        super(name, label, EntityFieldType.COLLECTION, false);
        this.isSimpleField = false;
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            class: this.classGetter().name,
            through: this.throughGetter().name,
        };
    }
}
