import {ObjectNotFoundError} from "../../error/object-not-found.error";
import {Dictionary} from "../../../../base/type/dictionary.type";
import chalk from "chalk";
import {AbstractUser, ActionStepResult, ActionStepResultForm, ActionStepResultSelection, DataObject, Enemene, Filter, View} from "../../../..";
import {AbstractAction} from "../class/abstract-action.class";
import {ConstructorOf} from "../../../../base/constructor-of";
import {serializable} from "../../../../base/type/serializable.type";
import {ActionParameterConfiguration} from "../interface/action-parameter-configuration.interface";
import {InputValidationError} from "../../validation/error/input-validation.error";
import {ActionParameterType} from "../enum/action-parameter-type.enum";
import {uuid} from "../../../../base/type/uuid.type";
import {RequestContext} from "../../router/interface/request-context.interface";
import {ActionOriginInput} from "../interface/action-origin-input.interface";
import {FileService} from "../../file/service/file.service";
import {ActionInputValidationError} from "../class/action-input-validation-error.class";
import {ParameterType} from "../../router/enum/parameter-type.enum";
import {UnsupportedOperationError} from "../../error/unsupported-operation.error";
import {ViewFindService} from "../../view/service/view-find.service";
import {ViewHelperService} from "../../view/service/view-helper.service";
import {I18nService} from "../../i18n/service/i18n.service";

/**
 * Service for handling views for data manipulation.
 */
export class ActionService {

    private viewHelperService: ViewHelperService = Enemene.app.inject(ViewHelperService);
    private viewFindService: ViewFindService = Enemene.app.inject(ViewFindService);
    private fileService: FileService = Enemene.app.inject(FileService);
    private ACTIONS: Dictionary<ConstructorOf<AbstractAction>> = {};

    /**
     * Initializes the ActionService by importing all available actions and making them available.
     */
    public async init() {
        const actionFiles: string[] = this.fileService.scanForFilePattern(Enemene.app.config.modulesPath, /.*\.action\.js/);
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

        if (!actionClass.prototype.$action) {
            throw new Error(`Missing @Action annotation on action ${chalk.bold(name)}.`);
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

    public async validateActionInput<ENTITY extends DataObject<ENTITY>>(step: ActionParameterConfiguration, stepResult: ActionStepResult, input: serializable, context: RequestContext<AbstractUser>, actionName: string): Promise<any> {
        if (stepResult instanceof ActionStepResultForm) {
            if (input === undefined) {
                throw new InputValidationError([new ActionInputValidationError(I18nService.getI18nizedString(step.label, context.language))], actionName, context.language);
            }
            return this.viewHelperService.wrap(input as DataObject<ENTITY>, stepResult.view.prototype.$view);
        } else if (stepResult instanceof ActionStepResultSelection) {
            if (!Array.isArray(input)) {
                throw new InputValidationError([new ActionInputValidationError(I18nService.getI18nizedString(step.label, context.language))], actionName, context.language);
            }
            const selectedIds: uuid[] = input as uuid[];
            const objects: View<any>[] = await this.viewFindService.findAll(stepResult.view, context, Filter.in("id", selectedIds));
            if (stepResult.singleSelection && objects.length > 1) {
                throw new InputValidationError([new ActionInputValidationError(I18nService.getI18nizedString(step.label, context.language))], actionName, context.language);
            }
            if (stepResult.required && objects.length === 0) {
                throw new InputValidationError([new ActionInputValidationError(I18nService.getI18nizedString(step.label, context.language))], actionName, context.language);
            }
            return objects;
        } else {
            return null;
        }
    }

    public validateActionOrigin(origin?: Partial<ActionOriginInput>): void {
        if (!origin) {
            throw new UnsupportedOperationError("Origin not present.");
        }
        if (!origin.view) {
            throw new UnsupportedOperationError("Origin view not present.");
        }
        if (!origin.objectIds.length) {
            throw new UnsupportedOperationError("Origin object id(s) not present.");
        }
    }

    public async resolveParameter(step: ActionParameterConfiguration, param: [ActionParameterType | ParameterType, number?], origin: ActionOriginInput, validatedInputs: any[], context: RequestContext<AbstractUser>): Promise<any> {
        const [paramType, value] = param;
        switch (paramType) {
            case ActionParameterType.ORIGIN:
                return origin;
            case ActionParameterType.INPUT:
                return validatedInputs[value];
            case ActionParameterType.CONTEXT:
                return context;
        }

        return undefined;
    }
}
