import {EntityField} from "../../model/interface/entity-field.class";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {ActionConfiguration} from "../../action/interface/action-configuration.interface";

export interface DataResponse<ENTITY> {
    data: Partial<ENTITY> | Partial<ENTITY>[];

    model: Dictionary<Dictionary<EntityField> | string>;

    actions?: ActionConfiguration[];
}
