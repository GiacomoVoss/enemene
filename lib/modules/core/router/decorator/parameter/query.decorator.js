"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = void 0;
const parameter_decorator_1 = require("./parameter.decorator");
const parameter_type_enum_1 = require("../../enum/parameter-type.enum");
function Query(key) {
    return function (target, propertyKey, parameterIndex) {
        parameter_decorator_1.RegisterParameter(parameter_type_enum_1.ParameterType.QUERY, key)(target, propertyKey, parameterIndex);
    };
}
exports.Query = Query;
//# sourceMappingURL=query.decorator.js.map