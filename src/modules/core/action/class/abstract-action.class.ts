import {ActionConfiguration} from "../interface/action-configuration.interface";
import {ActionDefinition} from "../interface/action-definition.interface";
import {ActionParameterConfiguration} from "../interface/action-parameter-configuration.interface";
import {ActionService} from "../service/action.service";
import {Dictionary} from "../../../../base/type/dictionary.type";

export abstract class AbstractAction {

    $parameters: Dictionary<ActionParameterConfiguration, number>;

    $definition: ActionDefinition;

    abstract async execute(...args: any): Promise<void>

    public getConfiguration(): ActionConfiguration {
        return {
            name: this.constructor.name,
            label: this.$definition.label,
            parameters: this.getRequiredParameters(),
            meta: this.$definition.meta,
        };
    }

    public getRequiredParameters(): ActionParameterConfiguration[] {
        return Object.values(this.$parameters)
            .filter(ActionService.isRequiredParameter);
    }
}
