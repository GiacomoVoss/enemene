import {IncludeOptions, Op, WhereOptions} from "sequelize";
import {AbstractFilter} from "./abstract-filter.class";

export class FilterFalse extends AbstractFilter {

    public toSequelize(entity, includes: IncludeOptions[], prefix?: string): WhereOptions {
        return {
            [Op.eq]: [1, 2],
        };
    }

    public evaluate(object: any): boolean {
        return false;
    }

    public toString(): string {
        return "false";
    }
}
