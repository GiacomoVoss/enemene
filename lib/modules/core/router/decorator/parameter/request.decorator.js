"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Req = void 0;
const parameter_decorator_1 = require("./parameter.decorator");
const parameter_type_enum_1 = require("../../enum/parameter-type.enum");
function Req(target, propertyKey, parameterIndex) {
    parameter_decorator_1.RegisterParameter(parameter_type_enum_1.ParameterType.REQUEST)(target, propertyKey, parameterIndex);
}
exports.Req = Req;
//# sourceMappingURL=request.decorator.js.map