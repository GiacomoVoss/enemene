import {IncludeOptions, WhereOptions} from "sequelize/types/lib/model";
import {Op} from "sequelize";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {get} from "lodash";
import {AbstractFilter} from "./abstract-filter.class";

export class FilterIn extends AbstractFilter {
    constructor(private field: string,
                private values: string[]) {
        super();
    }

    public toSequelize(entity, includes: IncludeOptions[], prefix?: string): WhereOptions {
        return {[this.field]: {[Op.in]: this.values}};
    }

    evaluate(object: Dictionary<serializable>): boolean {
        const value: string | null = get(object, this.field, null) as string | null;
        if (value === null) {
            return false;
        }
        return this.values.includes(value);
    }
}
