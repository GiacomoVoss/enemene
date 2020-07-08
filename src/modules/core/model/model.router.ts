import {RouterModule} from "../router/decorator/router-module.decorator";
import {Get} from "../router/decorator/get.decorator";
import {Authorization} from "../auth/enum/authorization.enum";
import {Enemene} from "../application/enemene";

@RouterModule("model")
export class ModelRouter {

    @Get("entities", Authorization.PUBLIC)
    async getAllEntites(): Promise<string[]> {
        return Object.keys(Enemene.app.db.models).filter(entity => entity !== "DataObject");
    }
}
