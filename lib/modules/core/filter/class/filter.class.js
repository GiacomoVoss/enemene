"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Filter = void 0;
class Filter {
    constructor(name, args = [], parameters = []) {
        this.name = name;
        this.args = args;
        this.parameters = parameters;
    }
    static and(...args) {
        return new Filter("and", args);
    }
    static or(...args) {
        return new Filter("or", args);
    }
    static not(arg) {
        return new Filter("not", [arg]);
    }
    static equals(field, value) {
        return new Filter("equals", undefined, [field, value]);
    }
    static exists(entity, field, arg) {
        return new Filter("exists", arg ? [arg] : [], [entity, field]);
    }
}
exports.Filter = Filter;
//# sourceMappingURL=filter.class.js.map