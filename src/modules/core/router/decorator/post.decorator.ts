import {RequestMethod} from "../enum/request-method.enum";
import {Route} from "./route.decorator";
import {Authorization} from "../../auth/enum/authorization.enum";

export function Post(path: string, authorization: Authorization = Authorization.ROUTE): Function {
    return function (target: any, key: string, descriptor: PropertyDescriptor): void {
        Route(path, authorization, RequestMethod.POST)(target, key, descriptor);
    };
}
