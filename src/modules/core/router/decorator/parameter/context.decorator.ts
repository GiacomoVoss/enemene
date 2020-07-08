import {RegisterParameter} from "./parameter.decorator";
import {ParameterType} from "../../enum/parameter-type.enum";

export function Context(key?: string) {
    return function (target, propertyKey, parameterIndex: number): void {
        RegisterParameter(ParameterType.CONTEXT, key)(target, propertyKey, parameterIndex);
    };
}
