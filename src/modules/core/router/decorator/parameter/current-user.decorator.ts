import {RegisterParameter} from "./parameter.decorator";
import {ParameterType} from "../../enum/parameter-type.enum";

export function CurrentUser(target: Function, propertyKey: string, parameterIndex: number): void {
    RegisterParameter(ParameterType.CURRENT_USER)(target, propertyKey, parameterIndex);
}
