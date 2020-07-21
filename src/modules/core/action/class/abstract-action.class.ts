import {Dictionary} from "../../../../base/type/dictionary.type";
import {ActionConfiguration} from "../interface/action-configuration.interface";

export abstract class AbstractAction {

    $parameters: Dictionary<any[], "execute">;

    abstract async execute(...args: any): Promise<void>

    static getConfiguration(): ActionConfiguration {
        const parameters: Dictionary<any[]> = this.prototype.$parameters;
        return {
            name: this.name,
            parameters: parameters.execute.map((param: any) => ({
                type: param[0],
            }))
        };
    }
}
