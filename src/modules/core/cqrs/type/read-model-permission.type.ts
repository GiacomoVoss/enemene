import {Dictionary} from "../../../../base/type/dictionary.type";

type ReadModelFieldPermissionsMap = Dictionary<boolean>;

export type ReadModelFieldPermissions = Dictionary<boolean | ReadModelFieldPermissionsMap>;