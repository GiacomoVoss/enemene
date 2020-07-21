import {RouterModule} from "../router/decorator/router-module.decorator";
import {Get} from "../router/decorator/get.decorator";
import {Enemene} from "../application/enemene";

@RouterModule("model")
export class ModelRouter {

    @Get("entities", true)
    async getAllEntites(): Promise<string[]> {
        return Object.keys(Enemene.app.db.models).filter(entity => entity !== "DataObject");
    }
}
