import {AbstractController} from "../class/abstract-controller.class";

export function Controller(path: string) {
    return function (target: new () => AbstractController) {
        target.prototype.$path = path;
    };
}
