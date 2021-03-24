import {serializable} from "../../../../base/type/serializable.type";
import {AbstractUser} from "../../auth";
import {Transaction} from "sequelize/types/lib/transaction";
import {AbstractUserReadModel} from "../../auth/interface/abstract-user-read-model.interface";

export interface RequestContext<USER extends AbstractUser | AbstractUserReadModel> {
    [key: string]: serializable;

    language: string;

    currentUser?: USER;

    transaction?: Transaction;
}
