import { DataObject } from "../../model/data-object.model";
export declare class NamedFilter extends DataObject<NamedFilter> {
    name: string;
    entity: string;
    filter: string;
}
