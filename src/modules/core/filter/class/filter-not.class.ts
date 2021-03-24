import {Op, WhereOptions} from "sequelize";
import {IncludeOptions} from "sequelize/types/lib/model";
import {AbstractFilter} from "./abstract-filter.class";

export class FilterNot extends AbstractFilter {
    constructor(public arg: AbstractFilter) {
        super();
    }

    public toSequelize(entity, includes: IncludeOptions[], prefix?: string): WhereOptions {
        return {[Op.not]: this.arg.toSequelize(entity, includes, prefix)};
    }

    evaluate(object: any): boolean {
        return !this.arg.evaluate(object);
    }
}
