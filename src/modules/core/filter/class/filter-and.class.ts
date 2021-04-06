import {Op} from "sequelize";
import {IncludeOptions, WhereOptions} from "sequelize/types/lib/model";
import {AbstractFilter} from "./abstract-filter.class";
import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUserReadModel} from "../../auth";

export class FilterAnd extends AbstractFilter {
    constructor(private args: AbstractFilter[]) {
        super();
    }

    public toSequelize(entity, includes: IncludeOptions[], prefix?: string): WhereOptions {
        return {[Op.and]: this.args.map(arg => arg.toSequelize(entity, includes, prefix))};
    }

    public evaluate(object: any, context?: RequestContext<AbstractUserReadModel>): boolean {
        return this.args.reduce((result: boolean, arg: AbstractFilter) => {
            result = result && arg.evaluate(object, context);
            return result;
        }, true);
    }

    public toString(): string {
        return "(" + this.args.map(arg => arg.toString()).join(" and ") + ")";
    }
}
