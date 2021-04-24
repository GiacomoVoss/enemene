import {Body, Context, Path, Post} from "../router";
import {AbstractAction} from "./class/abstract-action.class";
import {ActionService} from "./service/action.service";
import {ViewInitializerService} from "../view";
import {AbstractController} from "../router/class/abstract-controller.class";
import {AbstractUser, ActionStepResultFile, ActionStepResultSuccess, DataObject, DataService, Enemene} from "../../..";
import {ActionStepResult} from "./class/action-step-result.class";
import {ActionResultStatus} from "./enum/action-result-status.enum";
import {ActionStepResultForm} from "./class/action-step-result-form.class";
import {ActionStepResultSelection} from "./class/action-step-result-selection.class";
import {ActionParameterType} from "./enum/action-parameter-type.enum";
import {RequestContext} from "../router/interface/request-context.interface";
import {CustomResponse} from "../router/class/custom-response.class";
import {ActionParameterConfiguration} from "./interface/action-parameter-configuration.interface";
import {ActionDataResponse} from "./interface/action-data-response.interface";
import {PermissionService} from "../auth/service/permission.service";
import {Controller} from "../router/decorator/controller.decorator";
import {ViewDefinition} from "../view/class/view-definition.class";
import {ViewHelperService} from "../view/service/view-helper.service";
import {I18nService} from "../i18n/service/i18n.service";
import {ActionOriginRequestInput} from "./interface/action-origin-request-input.interface";

@Controller("action")
export default class ActionController extends AbstractController {

    private actionService: ActionService = Enemene.app.inject(ActionService);
    private permissionService: PermissionService = Enemene.app.inject(PermissionService);
    private viewHelperService: ViewHelperService = Enemene.app.inject(ViewHelperService);

    @Post("/:action", true)
    async executeActionStep<ACTION extends AbstractAction>(@Context context: RequestContext<AbstractUser>,
                                                           @Path("action") actionName: string,
                                                           @Body("input") inputs: any[],
                                                           @Body("origin") origin: ActionOriginRequestInput): Promise<CustomResponse<ActionDataResponse<any> | ActionDataResponse<any>[] | null>> {
        const action: ACTION = this.actionService.getActionInstance(actionName);
        this.permissionService.checkActionPermission(ViewInitializerService.getViewDefinition(origin.view), actionName, context);
        this.actionService.validateActionOrigin(action, origin);

        const results: ActionStepResult[] = [];
        let currentStep: ActionParameterConfiguration;
        const validatedInputs: any[] = [];
        try {
            for (const step of action.getSteps()) {
                const parameters: [ActionParameterType, number?][] = action.getParameters(step.value.name) ?? [];
                if (parameters.find(([type, _]) => type === ActionParameterType.ORIGIN)) {
                    if (origin.objectIds.length > 1) {
                        for (const originId of origin.objectIds) {
                            const parameterValues: any[] = await Promise.all(parameters.map((param: [ActionParameterType, number?]) => this.actionService.resolveParameter(step, param, origin, originId, validatedInputs, context)));
                            results.push(await step.value.apply(action, parameterValues));
                        }
                        continue;
                    }
                }

                const parameterValues: any[] = await Promise.all(parameters.map((param: [ActionParameterType, number?]) => this.actionService.resolveParameter(step, param, origin, origin.objectIds[0], validatedInputs, context)));
                results.push(await step.value.apply(action, parameterValues));
                currentStep = step;

                if (inputs[step.index]) {
                    validatedInputs.push(await this.actionService.validateActionInput(step, results[results.length - 1], inputs[step.index], context, actionName));
                } else {
                    break;
                }
            }
        } catch (e) {
            throw e;
        }

        if (results.length !== 1) {
            const dataResults = await Promise.all(results.map(async r => this.parseActionResult(r, currentStep, context)));
            return this.responseWithStatus(200, dataResults.map(([_, data]) => data));
        } else {
            const lastResult: ActionStepResult = results.pop();
            const [status, data] = await this.parseActionResult(lastResult, currentStep, context);
            return this.responseWithStatus(status, data);
        }
    }

    private async parseActionResult(result: ActionStepResult, currentStep: ActionParameterConfiguration, context: RequestContext<AbstractUser>): Promise<[number, ActionDataResponse<any> | null]> {

        if (result.status === ActionResultStatus.SUCCESS) {
            return [200, {
                type: result.status,
                label: I18nService.getI18nizedString((result as ActionStepResultSuccess).message, context.language),
            }];
        }

        if (result.status === ActionResultStatus.FILE) {
            return [200, {
                type: ActionResultStatus.FILE,
                label: (result as ActionStepResultFile).fileId,
            }];
        }

        if (result.status === ActionResultStatus.FORM) {
            const formResult = result as ActionStepResultForm<any>;
            const viewDefinition: ViewDefinition<any> = formResult.view.prototype.$view;
            return [202, {
                data: {
                    data: formResult.object ?? {},
                    model: viewDefinition.getModel(context),
                },
                type: result.status,
                label: I18nService.getI18nizedString(currentStep.label, context.language),
            }];
        }

        if (result.status === ActionResultStatus.SELECTION) {
            const selectionResult = result as ActionStepResultSelection<any>;
            const viewDefinition: ViewDefinition<any> = selectionResult.view.prototype.$view;
            const data: DataObject<any>[] = await DataService.findAllRaw(viewDefinition.entity, this.viewHelperService.getFindOptions(viewDefinition, context));
            return [202, {
                data: {
                    data: data.map((object: DataObject<any>) => this.viewHelperService.wrap(object, viewDefinition)),
                    model: viewDefinition.getModel(context),
                },
                type: result.status,
                label: I18nService.getI18nizedString(currentStep.label, context.language),
                configuration: {
                    preselection: selectionResult.preselection,
                    singleSelection: selectionResult.singleSelection,
                },
            }];
        }
    }
}
