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
                @Body("password") password: string): Promise<string> {
        if (!username || !password) {
            throw new UnauthorizedError();
        }

        const user: AbstractUser = await Enemene.app.config.userModel.findOne({
            where: {
                username: username,
                active: true,
            }
        });

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
