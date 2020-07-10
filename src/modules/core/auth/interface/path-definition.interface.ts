import {RequestMethod} from "../../router/enum/request-method.enum";
import {Authorization} from "../enum/authorization.enum";

export interface PathDefinition {
    method: RequestMethod;

    path: string;

    fn: () => any;

    parameters: string[][];

    authorization: Authorization;
}
