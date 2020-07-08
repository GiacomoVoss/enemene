import { DataObject } from "../../model/data-object.model";
import { Role } from "./role.model";
import { uuid } from "../../../../base/type/uuid.type";
export declare class User extends DataObject<User> {
    $displayPattern: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    roleId: uuid;
    password: string;
}
