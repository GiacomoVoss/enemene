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
exports.NamedFilter = void 0;
const entity_decorator_1 = require("../../model/decorator/entity.decorator");
const data_object_model_1 = require("../../model/data-object.model");
const field_decorator_1 = require("../../model/decorator/field.decorator");
const sequelize_1 = require("sequelize");
const entity_field_type_enum_1 = require("../../model/enum/entity-field-type.enum");
let NamedFilter = class NamedFilter extends data_object_model_1.DataObject {
};
__decorate([
    field_decorator_1.Field("Name", entity_field_type_enum_1.EntityFieldType.STRING, true),
    __metadata("design:type", String)
], NamedFilter.prototype, "name", void 0);
__decorate([
    field_decorator_1.Field("Entität", entity_field_type_enum_1.EntityFieldType.STRING, true),
    __metadata("design:type", String)
], NamedFilter.prototype, "entity", void 0);
__decorate([
    field_decorator_1.Field("Filter", entity_field_type_enum_1.EntityFieldType.STRING, true, {
        type: sequelize_1.DataTypes.JSON,
    }),
    __metadata("design:type", String)
], NamedFilter.prototype, "filter", void 0);
NamedFilter = __decorate([
    entity_decorator_1.Entity
], NamedFilter);
exports.NamedFilter = NamedFilter;
//# sourceMappingURL=named-filter.model.js.map