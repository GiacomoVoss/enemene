import {Dictionary} from "../../../../base/type/dictionary.type";
import {ActionParameterConfiguration} from "./action-parameter-configuration.interface";

export interface ActionConfiguration {
    name: string;

    label: string;

    parameters: ActionParameterConfiguration[];

    meta?: Dictionary<any>;
}
