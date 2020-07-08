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
exports.User = void 0;
const data_object_model_1 = require("../../model/data-object.model");
const entity_decorator_1 = require("../../model/decorator/entity.decorator");
const field_decorator_1 = require("../../model/decorator/field.decorator");
const entity_field_type_enum_1 = require("../../model/enum/entity-field-type.enum");
const reference_decorator_1 = require("../../model/decorator/reference.decorator");
const role_model_1 = require("./role.model");
let User = class User extends data_object_model_1.DataObject {
    constructor() {
        super(...arguments);
        this.$displayPattern = "{firstName} {lastName}";
    }
};
__decorate([
    field_decorator_1.Field("E-Mail", entity_field_type_enum_1.EntityFieldType.EMAIL, true, {
        allowNull: false,
    }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    field_decorator_1.Field("Vorname", entity_field_type_enum_1.EntityFieldType.STRING, true),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    field_decorator_1.Field("Nachname", entity_field_type_enum_1.EntityFieldType.STRING, true),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    reference_decorator_1.Reference("Rolle", () => role_model_1.Role),
    __metadata("design:type", role_model_1.Role)
], User.prototype, "role", void 0);
__decorate([
    field_decorator_1.Field("Passwort"),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
User = __decorate([
    entity_decorator_1.Entity
], User);
exports.User = User;
//# sourceMappingURL=user.model.js.map