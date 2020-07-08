import {RequestMethod} from "../../router/enum/request-method.enum";
import {Authorization} from "../enum/authorization.enum";
import {PathRequestHandlerFunction} from "../../router/type/path-request-handler-function.type";

export interface PathDefinition {
    method: RequestMethod;

    path: string;

    fn: () => PathRequestHandlerFunction<any>;

    parameters: string[][];

    authorization: Authorization;
}
