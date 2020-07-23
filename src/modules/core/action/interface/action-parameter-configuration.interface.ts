import {ActionParameterType} from "../enum/parameter-type.enum";
import {ParameterType} from "../../router/enum/parameter-type.enum";

export interface ActionParameterConfiguration {
    type: ActionParameterType | ParameterType;

    config: object;
    
    index: number;
}
