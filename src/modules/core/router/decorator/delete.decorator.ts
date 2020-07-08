import {RequestMethod} from "../enum/request-method.enum";
import {Route} from "./route.decorator";
import {Authorization} from "../../auth/enum/authorization.enum";

export function Delete(path: string, authorization: Authorization = Authorization.ROUTE): Function {
    return function (target: any, key: string, descriptor: PropertyDescriptor): void {
        Route(path, authorization, RequestMethod.DELETE)(target, key, descriptor);
    };
}
