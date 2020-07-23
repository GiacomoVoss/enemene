import {Dictionary} from "../../../../base/type/dictionary.type";
import {ActionConfiguration} from "../interface/action-configuration.interface";
import {ActionDefinition} from "../interface/action-definition.interface";
import {ActionParameterConfiguration} from "../interface/action-parameter-configuration.interface";
import {ActionService} from "../service/action.service";

export abstract class AbstractAction {

    $parameters: Dictionary<any[], "execute">;

    $definition: ActionDefinition;

    abstract async execute(...args: any): Promise<void>

    static getConfiguration(): ActionConfiguration {
        return {
            name: this.name,
            label: this.prototype.$definition.label,
            parameters: this.getRequiredParameters(),
            meta: this.prototype.$definition.meta,
        };
    }

    static getRequiredParameters(): ActionParameterConfiguration[] {
        return (this.prototype.$parameters?.execute ?? []).map((param: any, index: number) => ({
            label: param[0],
            type: param[1],
            config: param[2],
            index,
        } as ActionParameterConfiguration))
            .filter(ActionService.isRequiredParameter);
    }
}
