import {PathDefinition} from "../../auth/interface/path-definition.interface";
import {RequestMethod} from "../enum/request-method.enum";
import {Authorization} from "../../auth/enum/authorization.enum";

export function Route(path: string, authorization: Authorization = Authorization.ROUTE, requestMethod: RequestMethod): Function {
    return function (target: any, key: string, descriptor: PropertyDescriptor): void {
        const paths: PathDefinition[] = target.constructor.prototype.$paths || [];
        const parameters = target.constructor.prototype.$parameters || {};

        paths.push({
            method: requestMethod,
            path,
            fn: descriptor.value,
            parameters: parameters[key] ?? [],
            authorization,
        });

        target.constructor.prototype.$paths = paths;
    };
}
