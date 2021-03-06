import {EntityField} from "./entity-field.class";
import {EntityFieldType} from "../enum/entity-field-type.enum";

export class CalculatedField extends EntityField {
    constructor(public name: string,
                public label: string | string[],
                public returnType: EntityFieldType,
                public fn: Function,
                public classGetter?: () => any,
                public includeFields: string[] = []) {
        super(name, label, EntityFieldType.CALCULATED, false);
        this.isSimpleField = false;
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            returnType: this.returnType,
        };
    }
}
