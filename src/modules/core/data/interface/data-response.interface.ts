import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {ActionDefinition} from "../../action/interface/action-definition.interface";

export interface DataResponse<ENTITY> {
    data: Dictionary<any, keyof ENTITY> | Dictionary<any, keyof ENTITY>[];

    model: Dictionary<serializable>;

    actions?: ActionDefinition[];
}
