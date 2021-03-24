import {UnauthorizedError} from "./error/unauthorized.error";
import * as bcrypt from "bcrypt";
import {AuthService} from "./service/auth.service";
import {Body, Get, Post} from "../router";
import {AbstractUser, Enemene} from "../../..";
import {AbstractController} from "../router/class/abstract-controller.class";
import {Controller} from "../router/decorator/controller.decorator";

@Controller("auth")
export default class AuthController extends AbstractController {

    @Post("login", true)
    async login(@Body("username") username: string,
                @Body("password") password: string,
                @Body("populator") populator: boolean): Promise<string> {

        if (Enemene.app.devMode && populator) {
            return AuthService.createPopulatorUserToken();
        }

        if (!username || !password) {
            throw new UnauthorizedError();
        }

        const user: AbstractUser | null = await AuthService.findUser(username);

        if (!user) {
            throw new UnauthorizedError();
        }

        if (!(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedError();
        }

        return AuthService.createToken(user);
    }

    @Get("public-key", true)
    async getPublicKey(): Promise<string> {
        return AuthService.PUBLIC_KEY;
    }
}
