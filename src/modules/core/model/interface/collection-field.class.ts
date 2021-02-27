import {EntityField} from "./entity-field.class";
import {EntityFieldType} from "../enum/entity-field-type.enum";

export class CollectionField extends EntityField {
    public composition: boolean;

    constructor(public name: string,
                public label: string | string[],
                public classGetter: () => any,
                public mappedBy?: string) {
        super(name, label, EntityFieldType.COLLECTION, false);
        this.isSimpleField = false;
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            class: this.classGetter().name,
        };
    }
}
