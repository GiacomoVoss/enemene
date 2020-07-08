import {Dictionary} from "../../../../../base/type/dictionary.type";
import {ParameterType} from "../../enum/parameter-type.enum";

export function RegisterParameter(parameter: ParameterType, value?: string) {
    return function (target, propertyKey, parameterIndex: number): void {
        const parameters: Dictionary<any> = target.constructor.prototype.$parameters || {};

        if (!parameters[propertyKey]) {
            parameters[propertyKey] = [];
        }
        let parameterKey: string[] = [parameter];
        if (value) {
            parameterKey.push(value);
        }
        parameters[propertyKey][parameterIndex] = parameterKey;

        target.constructor.prototype.$parameters = parameters;
    };
}
