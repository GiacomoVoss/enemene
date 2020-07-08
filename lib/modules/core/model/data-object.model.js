"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataObject = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
/**
 * Basic abstract entity model.
 */
let DataObject = class DataObject extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
        this.$entity = this.constructor.name;
        this.$displayPattern = "{id}";
    }
    /**
     * Turns the object into JSON based on the {@link jsonDefinition}.
     */
    toJSON() {
        function unfold(value) {
            if (value == null) {
                return null;
            }
            if (value.toJSON) {
                return value.toJSON();
            }
            else if (Array.isArray(value)) {
                return value.map(v => unfold(v));
            }
            else {
                return value;
            }
        }
        const jsonDefinition = this.jsonDefinition || [];
        const fields = Object.keys(super.toJSON());
        const obj = {};
        fields.forEach(field => {
            let value;
            let key;
            const jsonRule = jsonDefinition[field];
            if (jsonRule) {
                if (jsonRule.key || jsonRule.fn) {
                    key = jsonRule.jsonKey || jsonRule.key;
                    value = this.getDataValue(jsonRule.key);
                    if (value === null || value === undefined) {
                        value = this[jsonRule.key];
                    }
                    if (jsonRule.fn) {
                        value = jsonRule.fn(value);
                    }
                }
            }
            else {
                key = field;
                value = this.getDataValue(key) || this[key];
                if (value === null || value === undefined) {
                    value = this[key];
                }
            }
            if (value !== null && value !== undefined) {
                obj[key] = unfold(value);
            }
        });
        return obj;
    }
};
__decorate([
    sequelize_typescript_1.Column({
        primaryKey: true,
    }),
    __metadata("design:type", String)
], DataObject.prototype, "id", void 0);
DataObject = __decorate([
    sequelize_typescript_1.Table,
    __metadata("design:paramtypes", [Object, Object])
], DataObject);
exports.DataObject = DataObject;
//# sourceMappingURL=data-object.model.js.map