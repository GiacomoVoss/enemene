import {ActionDefinition} from "../interface/action-definition.interface";
import {ActionParameterConfiguration} from "../interface/action-parameter-configuration.interface";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {ActionParameterType} from "../enum/action-parameter-type.enum";

export abstract class AbstractAction {

    protected $action: ActionDefinition;

    private $parameters: Dictionary<[ActionParameterType, number?][]>;

    private $steps: Dictionary<ActionParameterConfiguration, number>;

    public get hasOrigin(): boolean {
        return !!this.$action.hasOrigin;
    }

    public getSteps(): ActionParameterConfiguration[] {
        const entries: [string, ActionParameterConfiguration][] = Object.entries(this.$steps);
        entries.sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
        return entries.map(entry => entry[1]);
    }

    public getParameters(stepName: string): [ActionParameterType, number?][] {
        return this.$parameters[stepName];
    }
}
