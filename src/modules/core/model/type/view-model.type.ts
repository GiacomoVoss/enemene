import {uuid} from "../../../../base/type/uuid.type";
import {Dictionary} from "../../../../base/type/dictionary.type";

interface ViewModelAttributes {
    $root: uuid;
    $view: string;
    $meta: any;
}

export type ViewModel = Dictionary<any, uuid> & ViewModelAttributes;