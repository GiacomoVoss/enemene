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
exports.ViewPermission = void 0;
const entity_decorator_1 = require("../../model/decorator/entity.decorator");
const data_object_model_1 = require("../../model/data-object.model");
const field_decorator_1 = require("../../model/decorator/field.decorator");
const role_model_1 = require("./role.model");
const reference_decorator_1 = require("../../model/decorator/reference.decorator");
const entity_field_type_enum_1 = require("../../model/enum/entity-field-type.enum");
let ViewPermission = class ViewPermission extends data_object_model_1.DataObject {
    getPermissions() {
        return this.permissions.split("");
    }
};
__decorate([
    field_decorator_1.Field("View", entity_field_type_enum_1.EntityFieldType.STRING, true),
    __metadata("design:type", String)
], ViewPermission.prototype, "view", void 0);
__decorate([
    field_decorator_1.Field("Berechtigungen", entity_field_type_enum_1.EntityFieldType.STRING, true),
    __metadata("design:type", String)
], ViewPermission.prototype, "permissions", void 0);
__decorate([
    reference_decorator_1.Reference("Rolle", () => role_model_1.Role, true),
    __metadata("design:type", role_model_1.Role)
], ViewPermission.prototype, "role", void 0);
ViewPermission = __decorate([
    entity_decorator_1.Entity
], ViewPermission);
exports.ViewPermission = ViewPermission;
//# sourceMappingURL=view-permission.model.js.map