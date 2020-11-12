import {IncludeOptions, WhereOptions} from "sequelize/types/lib/model";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {AbstractFilter} from "./abstract-filter.class";

export class FilterTrue extends AbstractFilter {

    public toSequelize(entity, includes: IncludeOptions[], prefix?: string): WhereOptions {
        return {};
    }

    public evaluate(object: Dictionary<serializable>): boolean {
        return true;
    }
}
