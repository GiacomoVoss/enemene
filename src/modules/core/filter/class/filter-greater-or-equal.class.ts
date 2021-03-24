import {IncludeOptions, WhereAttributeHash, WhereOptions} from "sequelize/types/lib/model";
import {serializable} from "../../../../base/type/serializable.type";
import {get} from "lodash";
import {AbstractFilter} from "./abstract-filter.class";
import {Op} from "sequelize";

export class FilterGreaterOrEqual extends AbstractFilter {
    constructor(private field: string,
                private value: number | Date) {
        super();
    }

    public toSequelize(entity, includes: IncludeOptions[], prefix?: string): WhereOptions {
        if (prefix) {
            return {[`\$${prefix}.${this.field}\$`]: {[Op.gte]: this.value}} as WhereAttributeHash;
        } else {
            return {[this.field]: {[Op.gte]: this.value}} as WhereAttributeHash;
        }
    }

    public evaluate(object: any): boolean {
        const value: serializable = get(object, this.field);
        if (this.value === null || this.value === undefined) {
            return false;
        }
        if (typeof this.value === "number") {
            return this.value >= value;
        } else {
            return this.value.getTime() >= (value as Date).getTime();
        }
    }
}
