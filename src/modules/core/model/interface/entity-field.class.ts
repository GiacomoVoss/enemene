import {EntityFieldType} from "../enum/entity-field-type.enum";

export class EntityField {
    constructor(public name: string,
                public label: string,
                public type: EntityFieldType,
                public required: boolean) {
    }

    public toJSON(): any {
        return {
            name: this.name,
            label: this.label,
            type: this.type,
            required: this.required,
        };
    }
}
