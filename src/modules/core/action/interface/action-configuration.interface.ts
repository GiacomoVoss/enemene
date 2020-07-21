import {ActionParameterType} from "../enum/parameter-type.enum";

export interface ActionConfiguration {
    name: string;

    parameters: {
        type: ActionParameterType;
    }[];
}
