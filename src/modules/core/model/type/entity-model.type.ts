import {Dictionary} from "../../../../base/type/dictionary.type";
import {EntityField} from "../interface/entity-field.class";

export type EntityModel = Dictionary<Dictionary<EntityField> | string>;
