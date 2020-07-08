"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Body = void 0;
const parameter_decorator_1 = require("./parameter.decorator");
const parameter_type_enum_1 = require("../../enum/parameter-type.enum");
function Body(key) {
    return function (target, propertyKey, parameterIndex) {
        parameter_decorator_1.RegisterParameter(parameter_type_enum_1.ParameterType.BODY, key)(target, propertyKey, parameterIndex);
    };
}
exports.Body = Body;
//# sourceMappingURL=body.decorator.js.map