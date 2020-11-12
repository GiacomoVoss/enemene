import {RegisterParameter} from "./parameter.decorator";
import {ParameterType} from "../../enum/parameter-type.enum";

export function Path(key: string): Function {
    return function (target, propertyKey, parameterIndex: number): void {
        RegisterParameter(ParameterType.PATH, key)(target, propertyKey, parameterIndex);
    };
}
