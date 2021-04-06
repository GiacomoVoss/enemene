import {AbstractFilter} from "../../filter";

export interface ObjectsQueryInput {
    fields?: string;
    order?: [string, "asc" | "desc"][];
    limit?: number;
    offset?: number;
    filter?: AbstractFilter;
}