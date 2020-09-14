import {Dictionary} from "../../../../base/type/dictionary.type";
import {ActionConfiguration} from "../../action/interface/action-configuration.interface";
import {serializable} from "../../../../base/type/serializable.type";

export interface DataResponse<ENTITY> {
    data: Dictionary<any, keyof ENTITY> | Dictionary<any, keyof ENTITY>[];

    model: Dictionary<serializable>;

    actions?: ActionConfiguration[];
}
