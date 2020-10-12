import {ActionParameterType} from "../enum/parameter-type.enum";
import {ParameterType} from "../../router/enum/parameter-type.enum";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";

export interface ActionParameterConfiguration {
    label: string;

    type: ActionParameterType | ParameterType;

    config?: Dictionary<serializable>;

    index: number;
}
