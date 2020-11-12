import {ObjectNotFoundError} from "../../error/object-not-found.error";
import {Dictionary} from "../../../../base/type/dictionary.type";
import chalk from "chalk";
import {AbstractUser, ActionStepResult, ActionStepResultForm, ActionStepResultSelection, DataObject, Enemene, View, ViewService} from "../../../..";
import {AbstractAction} from "../class/abstract-action.class";
import {ConstructorOf} from "../../../../base/constructor-of";
import {serializable} from "../../../../base/type/serializable.type";
import {ActionParameterConfiguration} from "../interface/action-parameter-configuration.interface";
import {InputValidationError} from "../../validation/error/input-validation.error";
import {ActionParameterType} from "../enum/action-parameter-type.enum";
import {uuid} from "../../../../base/type/uuid.type";
import {MalformedActionInput} from "../error/malformed-action-input.error";
import {RequestContext} from "../../router/interface/request-context.interface";
import {ActionOriginInput} from "../interface/action-origin-input.interface";
import {FileService} from "../../file/service/file.service";

/**
 * Service for handling views for data manipulation.
 */
export class ActionService {

    private viewService: ViewService = Enemene.app.inject(ViewService);
    private fileService: FileService = Enemene.app.inject(FileService);
    private ACTIONS: Dictionary<ConstructorOf<AbstractAction>> = {};

    /**
     * Initializes the ActionService by importing all available actions and making them available.
     */
    public async init() {
        const actionFiles: string[] = this.fileService.scanForFilePattern(process.cwd(), /.*\.action\.js/);
        const actionModules: Dictionary<ConstructorOf<AbstractAction>>[] = await Promise.all(actionFiles.map((filePath: string) => import(filePath)));
        let length: number = 0;
        actionModules.forEach((moduleMap: Dictionary<ConstructorOf<AbstractAction>>) => {
            Object.values(moduleMap).forEach((module: ConstructorOf<AbstractAction>) => {
                this.addAction(module.name, module);
                Enemene.log.debug(this.constructor.name, `Registering ${chalk.bold(module.name)}`);
                length++;
            });
        });

        Enemene.log.info(this.constructor.name, `Registered ${chalk.bold(length)} actions.`);
    }

    /**
     * Add a {@link View} to the view list.
     *
     * @param name Name of the view.
     * @param actionClass The action's class.
     */
    public addAction(name: string, actionClass: ConstructorOf<AbstractAction>): void {
        if (this.ACTIONS[name]) {
            throw new Error(`Duplicate action name ${chalk.bold(name)}.`);
        }

        this.ACTIONS[name] = actionClass;
    }

    /**
     * Gets a {@link View} from the view list.
     * Throws an {@link ObjectNotFoundError} if it wasn't found.
     *
     * @param actionName Name of the view.
     */
    public getActionInstance<ACTION extends AbstractAction>(actionName: string): ACTION {
        const actionClass: ConstructorOf<ACTION> = this.ACTIONS[actionName] as ConstructorOf<ACTION>;
        if (!actionClass) {
            throw new ObjectNotFoundError(actionName);
        }
        return new actionClass();
    }

    public async validateActionInput<ENTITY extends DataObject<ENTITY>>(step: ActionParameterConfiguration, stepResult: ActionStepResult, input: serializable, context: RequestContext<AbstractUser>): Promise<any> {
        if (stepResult instanceof ActionStepResultForm) {
            if (input === undefined) {
                throw new InputValidationError([{
                    type: "actionInput",
                    field: step.label,
                    message: "required",
                }]);
            }
            return this.viewService.wrap(input as DataObject<ENTITY>, stepResult.view.prototype.$view);
        } else if (stepResult instanceof ActionStepResultSelection) {
            if (!Array.isArray(input)) {
                throw new MalformedActionInput([{
                    type: "actionInput",
                    field: step.label,
                    message: "malformed",
                }]);
            }
            const selectedIds: uuid[] = input as uuid[];
            const objects: View<any>[] = (await this.viewService.findAll(stepResult.view.prototype.$view, context))
                .filter((object: View<ENTITY>) => selectedIds.includes(object.id));
            if (stepResult.singleSelection && objects.length > 1) {
                throw new MalformedActionInput([{
                    type: "actionInput",
                    field: step.label,
                    message: "malformed",
                }]);
            }
            if (stepResult.required && objects.length === 0) {
                throw new MalformedActionInput([{
                    type: "actionInput",
                    field: step.label,
                    message: "required",
                }]);
            }
            return objects;
        } else {
            return null;
        }
    }

    public async resolveParameter(step: ActionParameterConfiguration, param: [ActionParameterType, number?], origin: ActionOriginInput, validatedInputs: any[]): Promise<any> {
        const [paramType, value] = param;
        let parameterValue: any = undefined;
        switch (paramType) {
            case ActionParameterType.ORIGIN:
                parameterValue = origin;
                break;
            case ActionParameterType.INPUT:
                parameterValue = validatedInputs[value];
                break;
        }

        return parameterValue;
    }
}
