import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {ActionDefinition} from "../../action/interface/action-definition.interface";

export interface DataResponse<TYPE> {
    data: TYPE;

    model: Dictionary<serializable>;

    actions?: ActionDefinition[];
}
