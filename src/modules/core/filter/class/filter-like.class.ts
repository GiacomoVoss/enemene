import {IncludeOptions, WhereOptions} from "sequelize/types/lib/model";
import {Op} from "sequelize";
import {get} from "lodash";
import {AbstractFilter} from "./abstract-filter.class";

export class FilterLike extends AbstractFilter {
    constructor(private field: string,
                private value: string) {
        super();
    }

    public toSequelize(entity, includes: IncludeOptions[], prefix?: string): WhereOptions {
        if (prefix) {
            return {
                [`\$${prefix}.${this.field}\$`]: {
                    [Op.like]: `%${this.value}%`
                }
            };
        } else {
            return {
                [this.field]: {
                    [Op.like]: `%${this.value}%`
                }
            };
        }
    }

    evaluate(object: any): boolean {
        const value: string | null = get(object, this.field, null) as string | null;
        if (value === null) {
            return false;
        }
        return value.toLowerCase().includes(this.value.toLowerCase());
    }
}
