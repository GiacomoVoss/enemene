import {PathDefinition} from "../../auth/interface/path-definition.interface";
import {RequestMethod} from "../enum/request-method.enum";
import {AbstractController} from "..";

export function Route(path: string, isPublic: boolean, requestMethod: RequestMethod): Function {
    return function (target: new () => AbstractController, key: string, descriptor: PropertyDescriptor): void {
        const paths: PathDefinition[] = target.constructor.prototype.$paths || [];
        const parameters = target.constructor.prototype.$parameters || {};

        paths.push({
            method: requestMethod,
            path,
            fn: descriptor.value,
            parameters: parameters[key] ?? [],
            isPublic,
        });

        target.constructor.prototype.$paths = paths;
    };
}
