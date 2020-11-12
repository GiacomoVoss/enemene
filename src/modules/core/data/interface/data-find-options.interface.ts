import {Order} from "sequelize/types";

export interface DataFindOptions {
    order?: Order;
    limit?: number;
}
