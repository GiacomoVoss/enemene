import {ActionDefinition} from "../interface/action-definition.interface";

export function Action(config: ActionDefinition): Function {
    return function (target: any) {
        target.prototype.$action = {
            name: target.name,
            hasOrigin: target.prototype.$hasOrigin,
            ...config,
        };
    };
}
