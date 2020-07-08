"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterParameter = void 0;
function RegisterParameter(parameter, value) {
    return function (target, propertyKey, parameterIndex) {
        const parameters = target.constructor.prototype.$parameters || {};
        if (!parameters[propertyKey]) {
            parameters[propertyKey] = [];
        }
        let parameterKey = [parameter];
        if (value) {
            parameterKey.push(value);
        }
        parameters[propertyKey][parameterIndex] = parameterKey;
        target.constructor.prototype.$parameters = parameters;
    };
}
exports.RegisterParameter = RegisterParameter;
//# sourceMappingURL=parameter.decorator.js.map