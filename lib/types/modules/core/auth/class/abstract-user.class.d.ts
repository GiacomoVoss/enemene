import { Role } from "..";
import { uuid } from "../../../../base/type/uuid.type";
import { DataObject } from "../../model";
export declare class AbstractUser extends DataObject<AbstractUser> {
    username: string;
    password: string;
    role: Role;
    roleId: uuid;
}
