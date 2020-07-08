"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const parameter_decorator_1 = require("./parameter.decorator");
const parameter_type_enum_1 = require("../../enum/parameter-type.enum");
function Context(key) {
    return function (target, propertyKey, parameterIndex) {
        parameter_decorator_1.RegisterParameter(parameter_type_enum_1.ParameterType.CONTEXT, key)(target, propertyKey, parameterIndex);
    };
}
exports.Context = Context;
//# sourceMappingURL=context.decorator.js.map