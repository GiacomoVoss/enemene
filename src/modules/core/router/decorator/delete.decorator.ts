import {RequestMethod} from "../enum/request-method.enum";
import {Route} from "./route.decorator";

export function Delete(path: string, isPublic: boolean = false): Function {
    return function (target: any, key: string, descriptor: PropertyDescriptor): void {
        Route(path, isPublic, RequestMethod.DELETE)(target, key, descriptor);
    };
}
