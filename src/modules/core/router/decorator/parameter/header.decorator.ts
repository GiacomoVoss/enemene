import {RegisterParameter} from "./parameter.decorator";
import {ParameterType} from "../../enum/parameter-type.enum";

export function Header(key: HttpHeader): Function {
    return function (target, propertyKey, parameterIndex: number): void {
        RegisterParameter(ParameterType.HEADER, key)(target, propertyKey, parameterIndex);
    };
}

export enum HttpHeader {
    LANGUAGE = "Accept-Language",
}
