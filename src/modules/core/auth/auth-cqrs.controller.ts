import {UnauthorizedError} from "./error/unauthorized.error";
import {AuthService} from "./service/auth.service";
import {Body, Get, Post} from "../router";
import {Enemene} from "../../..";
import {AbstractController} from "../router/class/abstract-controller.class";
import {Controller} from "../router/decorator/controller.decorator";
import {AuthCqrsService} from "./service/auth-cqrs.service";
import {AbstractUserReadModel} from "./interface/abstract-user-read-model.interface";

@Controller("auth")
export default class AuthCqrsController extends AbstractController {

    private authService: AuthCqrsService = Enemene.app.inject(AuthCqrsService);

    @Post("login", true)
    async login(@Body("username") username: string,
                @Body("password") password: string,
                @Body("populator") populator: boolean): Promise<string> {

        if (Enemene.app.devMode && populator) {
            return this.authService.createPopulatorUserToken();
        }

        if (!username || !password) {
            throw new UnauthorizedError();
        }

        const user: AbstractUserReadModel | null = this.authService.findUser(username);

        if (!user) {
            throw new UnauthorizedError();
        }

        if (!AbstractUserReadModel.comparePassword(password, user.password)) {
            throw new UnauthorizedError();
        }

        return AuthService.createToken(user);
    }

    @Get("public-key", true)
    async getPublicKey(): Promise<string> {
        return AuthService.PUBLIC_KEY;
    }
}
