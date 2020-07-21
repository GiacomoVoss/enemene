import {Get, Path, RouterModule} from "../router";
import {AbstractAction} from "./class/abstract-action.class";
import {ActionService} from "./service/action.service";

@RouterModule("action")
export default class ActionRouter {

    @Get("/:action", true)
    async getActionConfiguration<T extends typeof AbstractAction>(@Path("action") actionName: string): Promise<object> {
        const action: T = ActionService.getActionNotNull(actionName);
        return action.getConfiguration();
    }
}
