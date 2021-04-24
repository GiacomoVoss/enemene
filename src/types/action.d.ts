import {View} from "./view";
import {ConstructorOf, uuid} from "./base";
import {Dictionary} from "../base/type/dictionary.type";

/**
 * Define actions to simulate an input wizard consisting of multiple steps where user input is requested.
 * An action can have multiple {@link View}s which either require the user to fill out a form or select one or more entries from a table.
 * Define an action by creating a class extending {@link AbstractAction} annotated with {@link Action}.
 * Within the action, steps can be defined by creating a method (the method's name is irrelevant) and annotate it with {@link ActionStep}.
 * The step method must return an {@link ActionStepResult}, i.e. either one of these:
 * <ul>
 *     <li>{@link ActionStepResultForm} sends all information to display a form based on a view.</li>
 *     <li>{@link ActionStepResultSelection} sends all information to display a selection table based on a view.</li>
 *     <li>{@link ActionStepResultSuccess} sends the information that the last step of the action has been successfully executed.
 * </ul>
 *
 * An action can be executed by requesting <code>POST /action/TheViewOnWhichTheActionShouldBeExecuted/TheActionName</code>.
 * With every step, the client must always send all user inputs of previous and the current step in the body of the request.
 *
 * You can inject parameters in every action step method:
 * <ul>
 *     <li>{@link ActionOrigin} contains the {@link ActionOriginInput} of the executing, i.e. the view and the object(s) on which the action is executed.
 *     <li>{@link ActionInput(index: number)} contains the input of the respective action step.
 * </ul>
 */

/**
 * Annotate a class to declare it as an action.
 * @param config {ActionDefinition} The action's details.
 */
export function Action(config: ActionDefinition): Function;

/**
 * The details of an action.
 */
export interface ActionDefinition {
    /**
     * The label to describe the action to a user.
     */
    label: string;

    /**
     * Additional information for an action, e.g. display info for the frontend.
     */
    meta?: Dictionary<any>;
}

/**
 * An action class has to extend AbstractAction.
 */
export declare abstract class AbstractAction {
}

/**
 * An action step (action class method) has to return an ActionStepResult.
 */
export declare abstract class ActionStepResult {
}

/**
 * Return an ActionStepResultForm to provide an input form based on a view.
 */
export declare class ActionStepResultForm<VIEW extends View<any>> extends ActionStepResult {
    public view: ConstructorOf<VIEW>;
    public object?: VIEW;

    constructor(view: ConstructorOf<VIEW>,
                object?: VIEW);
}

/**
 * Return an ActionStepResultSelection to provide a selection table based on a view.
 */
export declare class ActionStepResultSelection<VIEW extends View<any>> extends ActionStepResult {
    public view: ConstructorOf<VIEW>;
    public preselection: VIEW[];
    public singleSelection: boolean;
    public required: boolean;

    constructor(view: ConstructorOf<VIEW>,
                preselection?: VIEW[],
                singleSelection?: boolean,
                required?: boolean);
}

/**
 * Return an ActionStepResultSuccess to signal the succession of the action.
 */
export declare class ActionStepResultSuccess extends ActionStepResult {
    constructor(message?: string | string[]);
}

/**
 * Return an ActionStepResultFile to provide a file to download. The downloadable file will be available for 5 minutes.
 */
export class ActionStepResultFile extends ActionStepResult {
    constructor(fileId: uuid);
}

/**
 * Annotate a class method to mark it as an action step. The step has to return an {@link ActionStepResult}.
 * @param index {number} The order index of the step.
 * @param label {string} The label to describe the step.
 */
export declare function ActionStep(index: number, label: string): Function;

/**
 * Annotate an action step input parameter to request the user input of a previous step.
 * @param stepIndex {number} The index of the step of which the input is requested.
 */
export declare function ActionInput(stepIndex: number): Function;

/**
 * Annotate an action step input parameter to request the action's origin (see {@link ActionOriginInput}.
 */
export declare function ActionOrigin(): Function;

/**
 * Contains the origin of the action.
 */
export declare interface ActionOriginInput {
    /**
     * The view on which the action was triggered.
     */
    view: string;

    /**
     * The object ID that were selected or visible when the action was triggered.
     */
    objectId: uuid;
}
