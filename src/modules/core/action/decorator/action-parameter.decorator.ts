import {ActionParameterType} from "../enum/parameter-type.enum";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {ActionParameterConfiguration} from "../interface/action-parameter-configuration.interface";

export function RegisterActionParameter(label: string, parameterType: ActionParameterType, configuration?: object) {
    return function (target, propertyKey, parameterIndex: number): void {
        const parameters: Dictionary<any> = target.constructor.prototype.$parameters || {};

        let parameter: ActionParameterConfiguration = {
            label,
            type: parameterType,
            index: parameterIndex
        };
        if (configuration) {
            parameter.config = configuration;
        }
        parameters[parameterIndex] = parameter;

        target.constructor.prototype.$parameters = parameters;
    };
}
