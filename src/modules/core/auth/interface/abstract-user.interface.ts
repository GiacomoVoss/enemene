import {Role} from "..";
import {uuid} from "../../../../base/type/uuid.type";
import {DataObject} from "../../model";

export class AbstractUser extends DataObject<AbstractUser> {

    $includeInToken: string[];

    username: string;

    password: string;

    role: Role;

    roleId: uuid;

    isPopulator?: boolean;
}

