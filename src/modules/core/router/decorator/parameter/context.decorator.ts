import {RegisterParameter} from "./parameter.decorator";
import {ParameterType} from "../../enum/parameter-type.enum";

export function Context(target, propertyKey, parameterIndex: number): void {
    RegisterParameter(ParameterType.CONTEXT)(target, propertyKey, parameterIndex);
}
