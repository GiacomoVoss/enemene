import * as jwt from "jsonwebtoken";
import {AbstractUser} from "..";

const fs = require("fs");

export class AuthService {

    public static PRIVATE_KEY: string;
    public static PUBLIC_KEY: string;
    public static INCLUDE_IN_TOKEN: string[] = [];

    public static init(userModel: typeof AbstractUser, publicKeyPath: string, privateKeyPath: string): void {
        this.PUBLIC_KEY = fs.readFileSync(publicKeyPath, "utf8");
        this.PRIVATE_KEY = fs.readFileSync(privateKeyPath, "utf8");
        const dummyUser = userModel.build();
        this.INCLUDE_IN_TOKEN = dummyUser.$includeInToken;
    }

    public static async authenticate(auth: string): Promise<AbstractUser | undefined> {
        if (!AuthService.PUBLIC_KEY) {
            return undefined;
        }
        try {
            const token = auth.split(" ")[1];
            const verified = jwt.verify(token, AuthService.PUBLIC_KEY, {
                algorithms: ["RS256"],
            });
            return verified as AbstractUser;
        } catch (e) {
            return undefined;
        }
    }

    public static createToken(user: AbstractUser): string {
        if (!AuthService.PUBLIC_KEY) {
            return undefined;
        }

        const payload: any = {
            id: user.id,
            username: user.username,
            roleId: user.roleId,
        };

        for (const additionalField of this.INCLUDE_IN_TOKEN) {
            payload[additionalField] = user[additionalField];
        }

        return jwt.sign(payload, AuthService.PRIVATE_KEY, {
            algorithm: "RS256",
        });
    }
}
