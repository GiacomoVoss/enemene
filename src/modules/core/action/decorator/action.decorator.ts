import {ActionDefinition} from "../interface/action-definition.interface";

export function Action(config: ActionDefinition) {
    return function (target: any) {
        target.prototype.$definition = config;
    };
}
