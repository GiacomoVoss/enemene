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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("../router");
const view_service_1 = require("./service/view.service");
const data_1 = require("../data");
const auth_1 = require("../auth");
const request_method_enum_1 = require("../router/enum/request-method.enum");
const unauthorized_error_1 = require("../auth/error/unauthorized.error");
let ViewDeleteRouter = class ViewDeleteRouter {
    deleteObject(user, viewName, objectId, context) {
        return __awaiter(this, void 0, void 0, function* () {
            auth_1.PermissionService.checkViewPermission(viewName, request_method_enum_1.RequestMethod.DELETE, user);
            const view = view_service_1.ViewService.getViewNotNull(viewName);
            const object = yield data_1.DataService.findNotNullById(view.entity(), objectId, view_service_1.ViewService.getFindOptions(view, user, context));
            object.destroy();
        });
    }
    deleteCollectionObject(user, viewName, objectId, collectionField, subObjectId, context) {
        return __awaiter(this, void 0, void 0, function* () {
            auth_1.PermissionService.checkViewPermission(viewName, request_method_enum_1.RequestMethod.POST, user);
            const baseView = view_service_1.ViewService.getViewNotNull(viewName);
            if (!baseView.fields.find(field => field === collectionField || field.field === collectionField)) {
                throw new unauthorized_error_1.UnauthorizedError();
            }
            const object = yield data_1.DataService.findNotNullById(baseView.entity(), objectId, view_service_1.ViewService.getFindOptions(baseView, user, context));
            yield object.$remove(collectionField, subObjectId);
        });
    }
};
__decorate([
    router_1.Delete("/:view/:id"),
    __param(0, router_1.CurrentUser),
    __param(1, router_1.Path("view")),
    __param(2, router_1.Path("id")),
    __param(3, router_1.Context()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_1.AbstractUser, String, String, Object]),
    __metadata("design:returntype", Promise)
], ViewDeleteRouter.prototype, "deleteObject", null);
__decorate([
    router_1.Post("/:view/:id/:attribute/:subId"),
    __param(0, router_1.CurrentUser),
    __param(1, router_1.Path("view")),
    __param(2, router_1.Path("id")),
    __param(3, router_1.Path("attribute")),
    __param(4, router_1.Path("subId")),
    __param(5, router_1.Context()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_1.AbstractUser, String, String, Object, String, Object]),
    __metadata("design:returntype", Promise)
], ViewDeleteRouter.prototype, "deleteCollectionObject", null);
ViewDeleteRouter = __decorate([
    router_1.RouterModule("view")
], ViewDeleteRouter);
exports.default = ViewDeleteRouter;
//# sourceMappingURL=view-delete.router.js.map