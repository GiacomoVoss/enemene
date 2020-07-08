import { ParameterType } from "../../enum/parameter-type.enum";
export declare function RegisterParameter(parameter: ParameterType, value?: string): (target: any, propertyKey: any, parameterIndex: number) => void;
