import {IncludeOptions, WhereAttributeHash, WhereOptions} from "sequelize/types/lib/model";
import {serializable} from "../../../../base/type/serializable.type";
import {get} from "lodash";
import {AbstractFilter} from "./abstract-filter.class";
import {Op} from "sequelize";
import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUserReadModel} from "../../auth";

export class FilterLessOrEqual extends AbstractFilter {
    constructor(private field: string,
                private value: number | Date) {
        super();
    }

    public toSequelize(entity, includes: IncludeOptions[], prefix?: string): WhereOptions {
        if (prefix) {
            return {[`\$${prefix}.${this.field}\$`]: {[Op.lte]: this.value}} as WhereAttributeHash;
        } else {
            return {[this.field]: {[Op.lte]: this.value}} as WhereAttributeHash;
        }
    }

    public evaluate(object: any, context: RequestContext<AbstractUserReadModel>): boolean {
        const value: serializable = get(object, this.field);
        const myValue: number | Date | string = this.getValue(this.value, context);
        if (myValue === null || myValue === undefined) {
            return false;
        }
        if (typeof myValue === "number") {
            return myValue >= value;
        } else if (myValue instanceof Date) {
            return myValue.getTime() <= (value as Date).getTime();
        }
    }

    public toString(): string {
        return `${this.field} ≤ '${this.value}'`;
    }
}
