"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Path = void 0;
const parameter_decorator_1 = require("./parameter.decorator");
const parameter_type_enum_1 = require("../../enum/parameter-type.enum");
function Path(key) {
    return function (target, propertyKey, parameterIndex) {
        parameter_decorator_1.RegisterParameter(parameter_type_enum_1.ParameterType.PATH, key)(target, propertyKey, parameterIndex);
    };
}
exports.Path = Path;
//# sourceMappingURL=path.decorator.js.map