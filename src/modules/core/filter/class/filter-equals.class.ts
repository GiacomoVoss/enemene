import {IncludeOptions, WhereAttributeHash, WhereOptions} from "sequelize/types/lib/model";
import {serializable} from "../../../../base/type/serializable.type";
import {get} from "lodash";
import {AbstractFilter} from "./abstract-filter.class";
import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUserReadModel} from "../../auth";

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

    public evaluate(object: any, context: RequestContext<AbstractUserReadModel>): boolean {
        let objectValue: serializable = get(object, this.field);
        return objectValue === this.getValue(this.value, context);
    }

    public toString(): string {
        return `${this.field} == '${this.value}'`;
    }
}
