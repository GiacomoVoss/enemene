import {RequestMethod} from "../enum/request-method.enum";
import {Route} from "./route.decorator";
import {AbstractController} from "..";

export function PostFile(path: string, isPublic: boolean = false): Function {
    return function (target: new () => AbstractController, key: string, descriptor: PropertyDescriptor): void {
        Route(path, isPublic, RequestMethod.POSTFILE)(target, key, descriptor);
    };
}
