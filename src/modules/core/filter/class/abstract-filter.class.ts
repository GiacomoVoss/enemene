import {ConstructorOf} from "../../../../base/constructor-of";
import {DataObject} from "../../model";
import {IncludeOptions, WhereOptions} from "sequelize/types/lib/model";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";

export abstract class AbstractFilter {

    public abstract toSequelize(entity: ConstructorOf<DataObject<any>>, includes: IncludeOptions[], prefix?: string): WhereOptions;

    public abstract evaluate(object: Dictionary<serializable>): boolean;
}
