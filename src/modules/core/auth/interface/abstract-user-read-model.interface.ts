import {ReadModel} from "../../cqrs";
import {uuid} from "../../../../base/type/uuid.type";
import * as bcrypt from "bcrypt";
import {genSaltSync} from "bcrypt";

export class AbstractUserReadModel extends ReadModel {

    $includeInToken: string[];

    username: string;

    password: string;

    roleId: uuid;

    active: boolean;

    isPopulator?: boolean;

    static encodePassword(password: string): string {
        return bcrypt.hashSync(password, genSaltSync()) as string;
    }

    static comparePassword(clearTextPassword: string, encryptedPassword: string): boolean {
        return bcrypt.compareSync(clearTextPassword, encryptedPassword);
    }
}

