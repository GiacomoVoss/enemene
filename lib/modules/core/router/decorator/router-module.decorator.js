"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouterModule = void 0;
function RouterModule(modulePath) {
    return function (target) {
        target.prototype.$modulePath = modulePath;
    };
}
exports.RouterModule = RouterModule;
//# sourceMappingURL=router-module.decorator.js.map