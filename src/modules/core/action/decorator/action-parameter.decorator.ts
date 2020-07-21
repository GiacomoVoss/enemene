import {ActionParameterType} from "../enum/parameter-type.enum";
import {Dictionary} from "../../../../base/type/dictionary.type";

export function RegisterActionParameter(parameter: ActionParameterType, configuration?: object) {
    return function (target, propertyKey, parameterIndex: number): void {
        const parameters: Dictionary<any> = target.constructor.prototype.$parameters || {};

        if (!parameters[propertyKey]) {
            parameters[propertyKey] = [];
        }
        let parameterKey: [string, object?] = [parameter];
        if (configuration) {
            parameterKey.push(configuration);
        }
        parameters[propertyKey][parameterIndex] = parameterKey;

        target.constructor.prototype.$parameters = parameters;
    };
}
