import {RegisterParameter} from "./parameter.decorator";
import {ParameterType} from "../../enum/parameter-type.enum";

export function Body(key?: string) {
    return function (target, propertyKey, parameterIndex: number): void {
        RegisterParameter(ParameterType.BODY, key)(target, propertyKey, parameterIndex);
    };
}
