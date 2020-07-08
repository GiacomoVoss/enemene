"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityNamed = exports.Entity = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const lodash_1 = require("lodash");
function Entity(target) {
    sequelize_typescript_1.Table({
        tableName: lodash_1.snakeCase(target.name),
    })(target);
}
exports.Entity = Entity;
function EntityNamed(tableName) {
    return sequelize_typescript_1.Table({
        tableName: tableName,
    });
}
exports.EntityNamed = EntityNamed;
//# sourceMappingURL=entity.decorator.js.map