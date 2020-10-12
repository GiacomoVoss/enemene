import {ObjectNotFoundError} from "../../error/object-not-found.error";
import {Dictionary} from "../../../../base/type/dictionary.type";
import chalk from "chalk";
import {Enemene, View, ViewService} from "../../../..";
import {AbstractAction} from "../class/abstract-action.class";
import {ActionParameterType} from "../enum/parameter-type.enum";
import {ParameterType} from "../../router/enum/parameter-type.enum";
import {ActionParameterConfiguration} from "../interface/action-parameter-configuration.interface";
import {ConstructorOf} from "../../../../base/constructor-of";

/**
 * Service for handling views for data manipulation.
 */
export class ActionService {

    private viewService: ViewService = Enemene.app.inject(ViewService);
    private ACTIONS: Dictionary<ConstructorOf<AbstractAction>> = {};

    /**
     * Initializes the ActionService by importing all available actions and making them available.
     *
     * @param actions
     */
    public async init(actions: Dictionary<Function>) {
        const length: number = Object.entries(actions).map(([actionName, actionClass]) => {
            this.addAction(actionName, actionClass as ConstructorOf<AbstractAction>);
            Enemene.log.debug(this.constructor.name, `Registering ${chalk.bold(actionName)}`);
            return actionClass;
        }).length;
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
        if (actionClass.prototype.$parameters) {
            Object.entries(actionClass.prototype.$parameters).forEach(([index, parameter]: [string, ActionParameterConfiguration]) => {
                const view: ConstructorOf<View<any>> | undefined = parameter.config.view as ConstructorOf<View<any>> | undefined;
                if (view) {
                    this.viewService.addViewClass(`${name}_${view.name}`, view);
                }
            });
        }
    }

    /**
     * Gets a {@link View} from the view list.
     * Throws an {@link ObjectNotFoundError} if it wasn't found.
     *
     * @param actionName Name of the view.
     */
    public getActionNotNull<ACTION extends AbstractAction>(actionName: string): ACTION {
        const actionClass: ConstructorOf<ACTION> = this.ACTIONS[actionName] as ConstructorOf<ACTION>;
        if (!actionClass) {
            throw new ObjectNotFoundError(actionName);
        }
        return new actionClass();
    }

    /**
     * Returns if the given parameter is required to be provided by the client.
     * @param parameter {ActionParameterConfiguration} The parameter to check.
     */
    public static isRequiredParameter(parameter: ActionParameterConfiguration): boolean {
        return [
                ActionParameterType.INPUT,
                ActionParameterType.SELECTION
            ].includes(parameter.type as ActionParameterType) ||
            [
                ParameterType.CONTEXT,
                ParameterType.QUERY,
                ParameterType.PATH,
            ].includes(parameter.type as ParameterType);
    }
}
