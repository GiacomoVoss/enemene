import {DataObject} from "../data-object.model";

export interface DataObjectChanges {
    created: DataObject<any>[];
    changed: DataObject<any>[];
    deleted: DataObject<any>[];
}