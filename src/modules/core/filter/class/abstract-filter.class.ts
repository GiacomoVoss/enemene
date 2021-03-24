import {ConstructorOf} from "../../../../base/constructor-of";
import {DataObject} from "../../model";
import {IncludeOptions, WhereOptions} from "sequelize/types/lib/model";

export abstract class AbstractFilter {

    public abstract toSequelize(entity: ConstructorOf<DataObject<any>>, includes: IncludeOptions[], prefix?: string): WhereOptions;

    public abstract evaluate(object: any): boolean;

    public apply<T>(objects: T[]): T[] {
        return objects
            .filter(object => this.evaluate(object));
    }
}
