import {Controller} from "../router/decorator/controller.decorator";
import {Get} from "../router/decorator/get.decorator";
import {Enemene} from "../application/enemene";
import {AbstractController} from "../router/class/abstract-controller.class";

@Controller("model")
export class ModelController extends AbstractController {

    @Get("entities", true)
    async getAllEntities(): Promise<string[]> {
        return Object.keys(Enemene.app.db.models).filter(entity => entity !== "DataObject");
    }
}
