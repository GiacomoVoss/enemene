import {UnauthorizedError} from "./error/unauthorized.error";
import * as bcrypt from "bcrypt";
import {AuthService} from "./service/auth.service";
import {Body, Get, Post, RouterModule} from "../router";
import {AbstractUser, Enemene} from "../../..";

@RouterModule("auth")
export default class AuthRouter {

    @Post("login", true)
    async login(@Body("username") username: string,
                @Body("password") password: string): Promise<string> {
        if (!username || !password) {
            throw new UnauthorizedError();
        }

        const user: AbstractUser = await Enemene.app.config.userModel.findOne({
            where: {
                username: username
            }
        });

        if (!user) {
            throw new UnauthorizedError();
        }

        if (!(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedError();
        }

        const payload: any = {
            id: user.id,
            username: user.username,
            roleId: user.roleId,
        };

        for (const additionalField of user.$includeInToken) {
            payload[additionalField] = user[additionalField];
        }

        return AuthService.sign(payload);
    }

    @Get("public-key", true)
    async getPublicKey(): Promise<string> {
        return AuthService.PUBLIC_KEY;
    }
}
