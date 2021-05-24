import {AbstractController, Controller, Get} from "../router";
import {Enemene} from "./enemene";

@Controller("root")
export class RootController extends AbstractController {

    @Get("health", true)
    async getHealth() {
        await Enemene.app.db.authenticate();
    }
}