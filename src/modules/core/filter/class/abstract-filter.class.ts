import {ConstructorOf} from "../../../../base/constructor-of";
import {DataObject} from "../../model";
import {IncludeOptions, WhereOptions} from "sequelize/types/lib/model";
import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUserReadModel} from "../../auth";
import {get} from "lodash";

export abstract class AbstractFilter {
    private static readonly IS_CONTEXT_PARAMETER = /^{(.*)}$/;

    public abstract toSequelize(entity: ConstructorOf<DataObject<any>>, includes: IncludeOptions[], prefix?: string): WhereOptions;

    public abstract evaluate(object: any, context?: RequestContext<AbstractUserReadModel>): boolean;

    public apply<T>(objects: T[], context?: RequestContext<AbstractUserReadModel>): T[] {
        return objects
            .filter(object => this.evaluate(object, context));
    }

    public abstract toString(): string;

    protected getValue<V>(value: V, context?: RequestContext<AbstractUserReadModel>): V | string {
        let myValue: V | string = value;
        if (myValue && typeof myValue === "string" && myValue.match(AbstractFilter.IS_CONTEXT_PARAMETER)) {
            myValue = myValue.replace(AbstractFilter.IS_CONTEXT_PARAMETER, "$1");
            myValue = get(context, myValue, value) as V | string;
        }
        return myValue;
    }
}
