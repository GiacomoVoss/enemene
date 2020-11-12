import {Body, Context, Path, Post} from "../router";
import {AbstractAction} from "./class/abstract-action.class";
import {ActionService} from "./service/action.service";
import {ViewService} from "../view";
import {AbstractController} from "../router/class/abstract-controller.class";
import {AbstractUser, DataObject, DataService, Enemene} from "../../..";
import {ActionStepResult} from "./class/action-step-result.class";
import {ActionResultStatus} from "./enum/action-result-status.enum";
import {ActionStepResultForm} from "./class/action-step-result-form.class";
import {ActionStepResultSelection} from "./class/action-step-result-selection.class";
import {ActionParameterType} from "./enum/action-parameter-type.enum";
import {RequestContext} from "../router/interface/request-context.interface";
import {CustomResponse} from "../router/class/custom-response.class";
import {ActionParameterConfiguration} from "./interface/action-parameter-configuration.interface";
import {ActionDataResponse} from "./interface/action-data-response.interface";
import {ActionOriginInput} from "./interface/action-origin-input.interface";
import {PermissionService} from "../auth/service/permission.service";
import {Controller} from "../router/decorator/controller.decorator";
import {ViewDefinition} from "../view/class/view-definition.class";

@Controller("action")
export default class ActionController extends AbstractController {

    private actionService: ActionService = Enemene.app.inject(ActionService);
    private permissionService: PermissionService = Enemene.app.inject(PermissionService);
    private viewService: ViewService = Enemene.app.inject(ViewService);

    @Post("/:view/:action", true)
    async executeActionStep<ACTION extends AbstractAction>(@Context() context: RequestContext<AbstractUser>,
                                                           @Path("view") viewName: string,
                                                           @Path("action") actionName: string,
                                                           @Body("origin") origin: ActionOriginInput,
                                                           @Body("input") inputs: any[]): Promise<CustomResponse<ActionDataResponse<any> | null>> {
        const action: ACTION = this.actionService.getActionInstance(actionName);
        this.permissionService.checkActionPermission(viewName, actionName, context);
        let lastResult: ActionStepResult;
        let currentStep: ActionParameterConfiguration;
        const validatedInputs: any[] = [];
        for (const step of action.getSteps()) {
            const parameters: [ActionParameterType, number?][] = action.getParameters(step.value.name) ?? [];
            const parameterValues: any[] = await Promise.all(parameters.map((param: [ActionParameterType, number?]) => this.actionService.resolveParameter(step, param, origin, validatedInputs)));
            lastResult = await step.value.apply(action, parameterValues);
            currentStep = step;

            if (inputs[step.index]) {
                validatedInputs.push(await this.actionService.validateActionInput(step, lastResult, inputs[step.index], context));
            } else {
                break;
            }
        }

        if (lastResult.status === ActionResultStatus.SUCCESS) {
            return this.responseWithStatus(200, {
                type: lastResult.status,
            });
        }

        if (lastResult.status === ActionResultStatus.FORM) {
            const formResult = lastResult as ActionStepResultForm<any>;
            const viewDefinition: ViewDefinition<any> = formResult.view.prototype.$view;
            return this.responseWithStatus(202, {
                data: {
                    data: formResult.object ?? {},
                    model: viewDefinition.getModel(),
                },
                type: lastResult.status,
                label: currentStep.label,
            });
        }

        if (lastResult.status === ActionResultStatus.SELECTION) {
            const selectionResult = lastResult as ActionStepResultSelection<any>;
            const viewDefinition: ViewDefinition<any> = selectionResult.view.prototype.$view;
            const data: DataObject<any>[] = await DataService.findAllRaw(viewDefinition.entity, this.viewService.getFindOptions(viewDefinition, context));
            return this.responseWithStatus(202, {
                data: {
                    data: data.map((object: DataObject<any>) => this.viewService.wrap(object, viewDefinition)),
                    model: viewDefinition.getModel(),
                },
                type: lastResult.status,
                label: currentStep.label,
                configuration: {
                    preselection: selectionResult.preselection,
                    singleSelection: selectionResult.singleSelection,
                },
            });
        }
    }
}
