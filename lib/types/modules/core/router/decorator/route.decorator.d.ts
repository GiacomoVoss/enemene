import { RequestMethod } from "../enum/request-method.enum";
import { Authorization } from "../../auth/enum/authorization.enum";
export declare function Route(path: string, authorization: Authorization, requestMethod: RequestMethod): Function;
