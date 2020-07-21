import {RequestMethod} from "../../router/enum/request-method.enum";

export interface PathDefinition {
    method: RequestMethod;

    path: string;

    fn: () => any;

    parameters: string[][];

    isPublic: boolean;
}
