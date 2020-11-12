import {Dictionary} from "../../../../../base/type/dictionary.type";
import {ParameterType} from "../../enum/parameter-type.enum";
import {ActionParameterType} from "../../../action/enum/action-parameter-type.enum";

export function RegisterParameter(parameter: ParameterType | ActionParameterType, value?: string | number) {
    return function (target, propertyKey, parameterIndex: number): void {
        const parameters: Dictionary<any> = target.constructor.prototype.$parameters || {};

        if (!parameters[propertyKey]) {
            parameters[propertyKey] = [];
        }
        let parameterKey: (string | number)[] = [parameter];
        if (value !== undefined) {
            parameterKey.push(value);
        }
        parameters[propertyKey][parameterIndex] = parameterKey;

        target.constructor.prototype.$parameters = parameters;
    };
}
