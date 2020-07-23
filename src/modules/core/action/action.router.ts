import {Get, Path, RouterModule} from "../router";
import {AbstractAction} from "./class/abstract-action.class";
import {ActionService} from "./service/action.service";
import {View, ViewService} from "../view";
import {ObjectNotFoundError} from "../error/object-not-found.error";
import {DataResponse} from "../data";

@RouterModule("action")
export default class ActionRouter {

    @Get("/:action", true)
    async getActionConfiguration<T extends typeof AbstractAction>(@Path("action") actionName: string): Promise<object> {
        const action: T = ActionService.getActionNotNull(actionName);
        return action.getConfiguration();
    }

    @Get("/:action/:param", true)
    async getActionView<T extends typeof AbstractAction>(@Path("action") actionName: string,
                                                         @Path("param") param: number): Promise<DataResponse<any>> {
        const action: T = ActionService.getActionNotNull(actionName);
        const parameterConfig = action.prototype.$parameters.execute[param];
        if (!parameterConfig) {
            throw new ObjectNotFoundError();
        }

        const view: View<any> = parameterConfig[2]?.view ?? null;

        if (!view) {
            throw new ObjectNotFoundError();
        }

        return {
            data: {},
            model: ViewService.getModelForView(view)
        };
    }
}
