import {ObjectNotFoundError} from "../../error/object-not-found.error";
import {Dictionary} from "../../../../base/type/dictionary.type";
import chalk from "chalk";
import {Enemene} from "../../../..";
import {AbstractAction} from "../class/abstract-action.class";

/**
 * Service for handling views for data manipulation.
 */
export class ActionService {

    private static ACTIONS: Dictionary<typeof AbstractAction> = {};

    /**
     * Initializes the ActionService by importing all available actions and making them available.
     *
     * @param actions
     */
    public static async init(actions: Dictionary<typeof AbstractAction>) {
        const length: number = Object.entries(actions).map(([actionName, actionClass]) => {
            ActionService.addAction(actionName, actionClass);
            Enemene.log.debug(this.name, `Registering ${chalk.bold(actionName)}`);
            return actionClass;
        }).length;
        Enemene.log.info(this.name, `Registered ${chalk.bold(length)} Views.`);
    }

    /**
     * Add a {@link View} to the view list.
     *
     * @param name Name of the view.
     * @param actionClass The action's class.
     */
    public static addAction(name: string, actionClass: typeof AbstractAction): void {
        if (!ActionService.ACTIONS[name]) {
            ActionService.ACTIONS[name] = actionClass;
        }
    }

    /**
     * Gets a {@link View} from the view list.
     *
     * @param viewName Name of the view.
     */
    public static getAction(viewName: string): typeof AbstractAction {
        if (!ActionService.ACTIONS[viewName]) {
            return null;
        }

        return ActionService.ACTIONS[viewName];
    }

    /**
     * Gets a {@link View} from the view list.
     * Throws an {@link ObjectNotFoundError} if it wasn't found.
     *
     * @param actionName Name of the view.
     */
    public static getActionNotNull<T extends typeof AbstractAction>(actionName: string): T {
        const action: typeof AbstractAction = ActionService.getAction(actionName);
        if (action === null) {
            throw new ObjectNotFoundError(actionName);
        }
        return action as T;
    }
}
