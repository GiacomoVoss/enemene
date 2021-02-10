import {serializable} from "../../../../base/type/serializable.type";
import {AbstractUser} from "../../auth";

export interface RequestContext<USER extends AbstractUser> {
    [key: string]: serializable;

    language: string;

    currentUser?: USER;
}
