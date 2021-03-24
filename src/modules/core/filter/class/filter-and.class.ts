import {Op} from "sequelize";
import {IncludeOptions, WhereOptions} from "sequelize/types/lib/model";
import {AbstractFilter} from "./abstract-filter.class";

export class FilterAnd extends AbstractFilter {
    constructor(private args: AbstractFilter[]) {
        super();
    }

    public toSequelize(entity, includes: IncludeOptions[], prefix?: string): WhereOptions {
        return {[Op.and]: this.args.map(arg => arg.toSequelize(entity, includes, prefix))};
    }

    public evaluate(object: any): boolean {
        return this.args.reduce((result: boolean, arg: AbstractFilter) => {
            result = result && arg.evaluate(object);
            return result;
        }, true);
    }
}
