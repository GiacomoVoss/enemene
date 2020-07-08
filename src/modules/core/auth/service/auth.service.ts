import * as jwt from "jsonwebtoken";
import {AbstractUser} from "..";

const fs = require("fs");

export class AuthService {

    public static PRIVATE_KEY = fs.readFileSync("./keys/private.key", "utf8");
    public static PUBLIC_KEY = fs.readFileSync("./keys/public.key", "utf8");

    public static async authenticate(auth: string): Promise<AbstractUser | undefined> {
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

    public static sign(payload): string {
        return jwt.sign(payload, AuthService.PRIVATE_KEY, {
            algorithm: "RS256",
        });
    }
}
