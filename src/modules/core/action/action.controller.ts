import {Controller, CurrentUser, Get, Path} from "../router";
import {AbstractAction} from "./class/abstract-action.class";
import {ActionService} from "./service/action.service";
import {View, ViewService} from "../view";
import {ObjectNotFoundError} from "../error/object-not-found.error";
import {DataResponse} from "../data";
import {AbstractController} from "../router/class/abstract-controller.class";
import {AbstractUser, Enemene} from "../../..";
import {ActionParameterConfiguration} from "./interface/action-parameter-configuration.interface";
import {ActionParameterType} from "./enum/parameter-type.enum";
import {ConstructorOf} from "../../../base/constructor-of";

@Controller("action")
export default class ActionController extends AbstractController {

    private actionService: ActionService = Enemene.app.inject(ActionService);
    private viewService: ViewService = Enemene.app.inject(ViewService);

    @Get("/:action", true)
    async getActionConfiguration<ACTION extends AbstractAction>(@Path("action") actionName: string): Promise<object> {
        const action: ACTION = this.actionService.getActionNotNull(actionName);
        return action.getConfiguration();
    }

    @Get("/:action/:param", true)
    async getActionView<ACTION extends AbstractAction>(@CurrentUser user: AbstractUser,
                                                       @Path("action") actionName: string,
                                                       @Path("param") param: number): Promise<DataResponse<any>> {
        const action: ACTION = this.actionService.getActionNotNull(actionName);
        const parameterConfig: ActionParameterConfiguration | undefined = action.$parameters[param];
        if (!parameterConfig) {
            throw new ObjectNotFoundError();
        }

        const view: View<any> = this.getActionInputView(action, param);

        if (parameterConfig.type === ActionParameterType.SELECTION) {
            return {
                data: await this.viewService.findAll(view, ["*"], user),
                model: view.getModel(),
            };
        } else if (parameterConfig.type === ActionParameterType.INPUT) {
            return {
                data: {},
                model: view.getModel(),
            };
        }
    }

    private getActionInputView(action: AbstractAction, parameter: number): View<any> {
        const parameterConfig: ActionParameterConfiguration | undefined = action.$parameters[parameter];
        if (!parameterConfig) {
            throw new ObjectNotFoundError();
        }

        const viewClass: ConstructorOf<View<any>> = parameterConfig.config?.view as ConstructorOf<View<any>> ?? null;

        if (!viewClass) {
            throw new ObjectNotFoundError();
        }
        return new viewClass();
    }
}
