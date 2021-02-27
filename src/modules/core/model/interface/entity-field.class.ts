import {EntityFieldType} from "../enum/entity-field-type.enum";
import {serializable} from "../../../../base/type/serializable.type";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {ModelAttributeColumnOptions} from "sequelize";

export class EntityField {
    public isSimpleField: boolean = true;

    constructor(public name: string,
                public label: string | string[],
                public type: EntityFieldType,
                public required: boolean,
                public options: Partial<ModelAttributeColumnOptions> = {}) {
    }

    public toJSON(): any {
        const json: Dictionary<serializable> = {
            name: this.name,
            label: this.label,
            required: this.required,
        };
        if (Array.isArray(this.type)) {
            json.type = "ENUM";
            json.class =
                json.enumValues = this.type;
        } else {
            json.type = this.type;
        }

        return json;
    }
}
