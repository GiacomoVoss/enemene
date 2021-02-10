import {OrderItem} from "sequelize/types/lib/model";

export interface ViewFindOptions {
    order?: OrderItem[];
    limit?: number;
    offset?: number;
    searchString?: string;
}