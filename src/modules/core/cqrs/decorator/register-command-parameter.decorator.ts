import {CommandParameterType} from "../enum/command-parameter-type.enum";
import {Dictionary} from "../../../../base/type/dictionary.type";

export function RegisterCommandParameter(type: CommandParameterType) {
    return function (target, propertyKey, index: number): void {
        const parameters: Dictionary<any> = target.$parameters || [];

        parameters[index] = type;

        target.$parameters = parameters;
    };
}
