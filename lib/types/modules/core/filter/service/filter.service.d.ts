import { Filter } from "..";
import { FindOptions } from "sequelize/types/lib/model";
export declare class FilterService {
    static toSequelize(filter: Filter, context?: any): FindOptions;
    private static toSequelizeInternal;
    static replaceContext(value: string | number, context: any): string | number;
}
