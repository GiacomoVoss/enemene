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
exports.Role = void 0;
const model_1 = require("../../model");
const route_permission_model_1 = require("./route-permission.model");
const view_permission_model_1 = require("./view-permission.model");
const route_to_role_model_1 = require("../../router/model/route-to-role.model");
let Role = class Role extends model_1.DataObject {
    constructor() {
        super(...arguments);
        this.$displayPattern = "{name}";
    }
};
__decorate([
    model_1.Field("Name", model_1.EntityFieldType.STRING, true),
    __metadata("design:type", String)
], Role.prototype, "name", void 0);
__decorate([
    model_1.Collection("Routen-Berechtigungen", () => route_permission_model_1.RoutePermission, "roleId"),
    __metadata("design:type", Array)
], Role.prototype, "routePermissions", void 0);
__decorate([
    model_1.Collection("View-Berechtigungen", () => view_permission_model_1.ViewPermission, "roleId"),
    __metadata("design:type", Array)
], Role.prototype, "viewPermissions", void 0);
__decorate([
    model_1.Collection("Routen", () => route_to_role_model_1.RouteToRole, "roleId"),
    __metadata("design:type", Array)
], Role.prototype, "routes", void 0);
Role = __decorate([
    model_1.Entity
], Role);
exports.Role = Role;
//# sourceMappingURL=role.model.js.map