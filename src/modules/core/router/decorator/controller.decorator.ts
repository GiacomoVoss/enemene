import {AbstractController} from "../class/abstract-controller.class";

export function Controller(modulePath: string) {
    return function (target: new () => AbstractController) {
        target.prototype.$modulePath = modulePath;
    };
}
