import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";

export interface SnapshotSerializable {

    serialize(): Dictionary<serializable>;
}