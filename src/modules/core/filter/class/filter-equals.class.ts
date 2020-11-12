import {IncludeOptions, WhereAttributeHash, WhereOptions} from "sequelize/types/lib/model";
import {serializable} from "../../../../base/type/serializable.type";
import {get} from "lodash";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {AbstractFilter} from "./abstract-filter.class";

export class FilterEquals extends AbstractFilter {
    constructor(private field: string,
                private value: serializable) {
        super();
    }

    public toSequelize(entity, includes: IncludeOptions[], prefix?: string): WhereOptions {
        if (prefix) {
            return {[`\$${prefix}.${this.field}\$`]: this.value} as WhereAttributeHash;
        } else {
            return {[this.field]: this.value} as WhereAttributeHash;
        }
    }

    public evaluate(object: Dictionary<serializable>): boolean {
        const value: serializable = get(object, this.field);
        return value === this.value;
    }
}
