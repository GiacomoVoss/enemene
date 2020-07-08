export function RouterModule(modulePath: string) {
    return function (target: Function) {
        target.prototype.$modulePath = modulePath;
    };
}
