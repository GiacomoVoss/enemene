"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = void 0;
const parameter_decorator_1 = require("./parameter.decorator");
const parameter_type_enum_1 = require("../../enum/parameter-type.enum");
function CurrentUser(target, propertyKey, parameterIndex) {
    parameter_decorator_1.RegisterParameter(parameter_type_enum_1.ParameterType.CURRENT_USER)(target, propertyKey, parameterIndex);
}
exports.CurrentUser = CurrentUser;
//# sourceMappingURL=current-user.decorator.js.map