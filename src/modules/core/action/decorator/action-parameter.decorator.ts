import {ActionParameterType} from "../enum/parameter-type.enum";
import {Dictionary} from "../../../../base/type/dictionary.type";

export function RegisterActionParameter(label: string, parameterType: ActionParameterType, configuration?: object) {
    return function (target, propertyKey, parameterIndex: number): void {
        const parameters: Dictionary<any> = target.constructor.prototype.$parameters || {};

        if (!parameters[propertyKey]) {
            parameters[propertyKey] = [];
        }
        let parameter: [string, string, object?] = [label, parameterType];
        if (configuration) {
            parameter.push(configuration);
        }
        parameters[propertyKey][parameterIndex] = parameter;

        target.constructor.prototype.$parameters = parameters;
    };
}
