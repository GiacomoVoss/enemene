import {FindOptions, IncludeOptions, WhereOptions} from "sequelize/types/lib/model";
import {DataObject} from "../../../..";
import {ConstructorOf} from "../../../../base/constructor-of";
import {AbstractFilter} from "../class/abstract-filter.class";

export class FilterService {

    public static toSequelize<ENTITY extends DataObject<ENTITY>>(filter: AbstractFilter, entity: ConstructorOf<ENTITY>): FindOptions {
        const include: IncludeOptions[] = [];
        const where: WhereOptions = filter ? filter.toSequelize(entity, include) : {};
        return {
            where,
            include,
        };
    }
}
