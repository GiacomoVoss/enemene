import {Dictionary} from "../../../../base/type/dictionary.type";

export interface ActionDefinition {
    label: string | string[];
    meta?: Dictionary<any>;
    hasOrigin?: boolean;
}
