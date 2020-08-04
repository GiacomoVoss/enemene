import {EntityFieldType} from "../enum/entity-field-type.enum";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";

export class EntityField {
    constructor(public name: string,
                public label: string,
                public type: EntityFieldType,
                public required: boolean) {
    }

    public toJSON(): any {
        const json: Dictionary<serializable> = {
            name: this.name,
            label: this.label,
            required: this.required,
        };
        if (Array.isArray(this.type)) {
            json.type = "ENUM";
            json.enumValues = this.type;
        } else {
            json.type = this.type;
        }

        return json;
    }
}
