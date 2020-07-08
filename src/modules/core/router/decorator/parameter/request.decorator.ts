import {RegisterParameter} from "./parameter.decorator";
import {ParameterType} from "../../enum/parameter-type.enum";

export function Req(target, propertyKey, parameterIndex: number): void {
    RegisterParameter(ParameterType.REQUEST)(target, propertyKey, parameterIndex);
}
