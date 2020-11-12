import {RegisterParameter} from "./parameter.decorator";
import {ParameterType} from "../../enum/parameter-type.enum";

export function Body(key?: string): Function {
    return function (target, propertyKey, parameterIndex: number): void {
        RegisterParameter(ParameterType.BODY, key)(target, propertyKey, parameterIndex);
    };
}
