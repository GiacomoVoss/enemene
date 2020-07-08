import { EntityField } from "../../model/interface/entity-field.class";
import { Dictionary } from "../../../../base/type/dictionary.type";
export interface DataResponse<ENTITY> {
    data: Partial<ENTITY> | Partial<ENTITY>[];
    model: Dictionary<Dictionary<EntityField> | string>;
}
