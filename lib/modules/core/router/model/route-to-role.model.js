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
exports.RouteToRole = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const entity_decorator_1 = require("../../model/decorator/entity.decorator");
const data_object_model_1 = require("../../model/data-object.model");
const reference_decorator_1 = require("../../model/decorator/reference.decorator");
const role_model_1 = require("../../auth/model/role.model");
const entity_field_type_enum_1 = require("../../model/enum/entity-field-type.enum");
const field_decorator_1 = require("../../model/decorator/field.decorator");
let RouteToRole = class RouteToRole extends data_object_model_1.DataObject {
    constructor() {
        super(...arguments);
        this.$displayPattern = "{route}";
    }
};
__decorate([
    reference_decorator_1.Reference("Rolle", () => role_model_1.Role),
    __metadata("design:type", role_model_1.Role)
], RouteToRole.prototype, "role", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => role_model_1.Role),
    __metadata("design:type", String)
], RouteToRole.prototype, "roleId", void 0);
__decorate([
    field_decorator_1.Field("Route", entity_field_type_enum_1.EntityFieldType.STRING, true),
    __metadata("design:type", String)
], RouteToRole.prototype, "route", void 0);
RouteToRole = __decorate([
    entity_decorator_1.Entity
], RouteToRole);
exports.RouteToRole = RouteToRole;
//# sourceMappingURL=route-to-role.model.js.map