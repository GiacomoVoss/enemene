import * as jwt from "jsonwebtoken";
import {AbstractUser} from "..";
import {Enemene} from "../../application";
import {AbstractUserReadModel} from "../interface/abstract-user-read-model.interface";
import {ConstructorOf} from "../../../../base/constructor-of";

const fs = require("fs");

export class AuthService {

    public static PRIVATE_KEY: string;
    public static PUBLIC_KEY: string;
    public static INCLUDE_IN_TOKEN: string[] = [];

    public static init(publicKeyPath: string, privateKeyPath: string, userModel?: ConstructorOf<AbstractUser>): void {
        this.PUBLIC_KEY = fs.readFileSync(publicKeyPath, "utf8");
        this.PRIVATE_KEY = fs.readFileSync(privateKeyPath, "utf8");
        if (userModel) {
            const dummyUser = new userModel();
            this.INCLUDE_IN_TOKEN = dummyUser.$includeInToken;
        }
    }

    public static initCqrs(publicKeyPath: string, privateKeyPath: string, userModel?: ConstructorOf<AbstractUserReadModel>): void {
        this.PUBLIC_KEY = fs.readFileSync(publicKeyPath, "utf8");
        this.PRIVATE_KEY = fs.readFileSync(privateKeyPath, "utf8");
        if (userModel) {
            const dummyUser = new userModel("dummy", false);
            this.INCLUDE_IN_TOKEN = dummyUser.$includeInToken;
        }
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

    public static createPopulatorUserToken(): string {
        return AuthService.createToken((Enemene.app.config.userModel as typeof AbstractUser).build({
            id: "5831500b-9ad0-4c82-b425-6373b0cc6f8f",
            username: "populator",
            roleId: "populator"
        }), true);
    }

    public static async findUser(username: string): Promise<AbstractUser | null> {
        return (Enemene.app.config.userModel as typeof AbstractUser).findOne<AbstractUser>({
            where: {
                username,
                active: true,
            }
        });
    }

    public static createToken(user: any, populator: boolean = false): string {
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

        if (Enemene.app.devMode && populator) {
            payload.isPopulator = true;
        }

        return jwt.sign(payload, AuthService.PRIVATE_KEY, {
            algorithm: "RS256",
        });
    }
}
