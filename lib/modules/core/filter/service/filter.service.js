"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterService = void 0;
const __1 = require("..");
const sequelize_1 = require("sequelize");
const __2 = require("../../../..");
class FilterService {
    static toSequelize(filter, context = {}) {
        const include = [];
        const where = this.toSequelizeInternal(filter, context, include);
        return {
            where,
            include,
        };
    }
    static toSequelizeInternal(filter, context, includes, prefix) {
        switch (filter.name) {
            case "equals":
                if (prefix) {
                    return { [`\$${prefix}.${FilterService.replaceContext(filter.parameters[0], context)}\$`]: FilterService.replaceContext(filter.parameters[1], context) };
                }
                else {
                    return { [FilterService.replaceContext(filter.parameters[0], context)]: FilterService.replaceContext(filter.parameters[1], context) };
                }
            case "and":
                return { [sequelize_1.Op.and]: filter.args.map(arg => FilterService.toSequelizeInternal(arg, context, includes, prefix)) };
            case "or":
                return { [sequelize_1.Op.or]: filter.args.map(arg => FilterService.toSequelizeInternal(arg, context, includes, prefix)) };
            case "not":
                return { [sequelize_1.Op.not]: FilterService.toSequelizeInternal(filter.args[0], context, includes, prefix) };
            case "exists":
                includes.push({
                    model: __2.Enemene.app.db.model(filter.parameters[0]),
                    as: filter.parameters[1],
                    required: true,
                });
                if (filter.args.length) {
                    return FilterService.toSequelizeInternal(filter.args[0], context, includes, filter.parameters[1]);
                }
        }
        return {};
    }
    static replaceContext(value, context) {
        if (typeof value !== "string") {
            return value;
        }
        let result = value;
        const matches = result.match(/{[\w\d]+}/g);
        if (matches) {
            matches.forEach((match) => {
                const key = match.replace(/{([\w\d]+)}/, "$1");
                if (!context[key]) {
                    throw new __1.ContextParameterMissingError(key);
                }
                result = result.replace(match, value);
            });
        }
        if (!isNaN(parseInt(result))) {
            return +result;
        }
        return result;
    }
}
exports.FilterService = FilterService;
//# sourceMappingURL=filter.service.js.map