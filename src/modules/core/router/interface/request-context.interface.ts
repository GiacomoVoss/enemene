import {serializable} from "../../../../base/type/serializable.type";
import {AbstractUser} from "../../auth";
import {Transaction} from "sequelize/types/lib/transaction";

export interface RequestContext<USER extends AbstractUser> {
    [key: string]: serializable;

    language: string;

    currentUser?: USER;

    transaction?: Transaction;
}
