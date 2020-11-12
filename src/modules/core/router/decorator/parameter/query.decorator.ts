import {RegisterParameter} from "./parameter.decorator";
import {ParameterType} from "../../enum/parameter-type.enum";

export function Query(key: string): Function {
    return function (target, propertyKey, parameterIndex: number): void {
        RegisterParameter(ParameterType.QUERY, key)(target, propertyKey, parameterIndex);
    };
}
