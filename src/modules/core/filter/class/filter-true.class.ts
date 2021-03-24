import {IncludeOptions, WhereOptions} from "sequelize/types/lib/model";
import {AbstractFilter} from "./abstract-filter.class";

export class FilterTrue extends AbstractFilter {

    public toSequelize(entity, includes: IncludeOptions[], prefix?: string): WhereOptions {
        return {};
    }

    public evaluate(object: any): boolean {
        return true;
    }
}
