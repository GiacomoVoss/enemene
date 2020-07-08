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
const auth_1 = require("../auth");
const view_service_1 = require("./service/view.service");
const data_1 = require("../data");
const request_method_enum_1 = require("../router/enum/request-method.enum");
const unauthorized_error_1 = require("../auth/error/unauthorized.error");
let ViewGetRouter = class ViewGetRouter {
    getObjects(user, viewName, orderString, context) {
        return __awaiter(this, void 0, void 0, function* () {
            auth_1.PermissionService.checkViewPermission(viewName, request_method_enum_1.RequestMethod.GET, user);
            const view = view_service_1.ViewService.getViewNotNull(viewName);
            const fields = view_service_1.ViewService.getFields(view);
            const order = orderString ? [orderString.split(":")] : undefined;
            const data = yield data_1.DataService.findAll(view.entity(), view_service_1.ViewService.getFindOptions(view, user, context));
            const model = view_service_1.ViewService.getModelForView(view);
            return {
                data: yield Promise.all(data.map((object) => data_1.DataService.filterFields(object, fields))),
                model,
            };
        });
    }
    getObject(user, viewName, objectId, context) {
        return __awaiter(this, void 0, void 0, function* () {
            auth_1.PermissionService.checkViewPermission(viewName, request_method_enum_1.RequestMethod.GET, user);
            const view = view_service_1.ViewService.getViewNotNull(viewName);
            const fields = view_service_1.ViewService.getFields(view);
            const data = yield data_1.DataService.findNotNullById(view.entity(), objectId, view_service_1.ViewService.getFindOptions(view, user, context));
            const model = view_service_1.ViewService.getModelForView(view);
            return {
                data: yield data_1.DataService.filterFields(data, fields),
                model,
            };
        });
    }
    getCollection(user, viewName, objectId, collectionField, context) {
        return __awaiter(this, void 0, void 0, function* () {
            auth_1.PermissionService.checkViewPermission(viewName, request_method_enum_1.RequestMethod.GET, user);
            const baseView = view_service_1.ViewService.getViewNotNull(viewName);
            if (!baseView.fields.find(field => field === collectionField || field.field === collectionField)) {
                throw new unauthorized_error_1.UnauthorizedError();
            }
            const fields = view_service_1.ViewService.getFields(baseView);
            const data = yield data_1.DataService.findNotNullById(baseView.entity(), objectId, view_service_1.ViewService.getFindOptions(baseView, user, context));
            const model = view_service_1.ViewService.getModelForView(baseView);
            const subFields = fields.filter(field => field.startsWith(`${String(collectionField)}.`));
            const subData = yield data_1.DataService.filterFields(data, subFields);
            return {
                data: subData[collectionField],
                model,
            };
        });
    }
    getCollectionObject(user, viewName, objectId, collectionField, subObjectId, context) {
        return __awaiter(this, void 0, void 0, function* () {
            auth_1.PermissionService.checkViewPermission(viewName, request_method_enum_1.RequestMethod.GET, user);
            const baseView = view_service_1.ViewService.getViewNotNull(viewName);
            if (!baseView.fields.find(field => field === collectionField || field.field === collectionField)) {
                throw new unauthorized_error_1.UnauthorizedError();
            }
            const fields = view_service_1.ViewService.getFields(baseView);
            const data = yield data_1.DataService.findNotNullById(baseView.entity(), objectId, view_service_1.ViewService.getFindOptions(baseView, user, context));
            const model = view_service_1.ViewService.getModelForView(baseView);
            const subFields = fields.filter(field => field.startsWith(`${String(collectionField)}.`));
            const subData = yield data_1.DataService.filterFields(data, subFields);
            let subObject;
            if (Array.isArray(subData[collectionField])) {
                subObject = subData[collectionField].find(object => object.id === subObjectId);
            }
            else {
                subObject = subData[collectionField].id === subObjectId ? subData[collectionField] : null;
            }
            return {
                data: subObject,
                model,
            };
        });
    }
    getViewModel(user, viewName) {
        return __awaiter(this, void 0, void 0, function* () {
            auth_1.PermissionService.checkViewPermission(viewName, request_method_enum_1.RequestMethod.GET, user);
            const view = view_service_1.ViewService.getViewNotNull(viewName);
            return view_service_1.ViewService.getModelForView(view);
        });
    }
};
__decorate([
    router_1.Get("/:view", auth_1.Authorization.ROUTE),
    __param(0, router_1.CurrentUser),
    __param(1, router_1.Path("view")),
    __param(2, router_1.Query("order")),
    __param(3, router_1.Context()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_1.AbstractUser, String, String, Object]),
    __metadata("design:returntype", Promise)
], ViewGetRouter.prototype, "getObjects", null);
__decorate([
    router_1.Get("/:view/:id", auth_1.Authorization.ROUTE),
    __param(0, router_1.CurrentUser),
    __param(1, router_1.Path("view")),
    __param(2, router_1.Path("id")),
    __param(3, router_1.Context()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_1.AbstractUser, String, String, Object]),
    __metadata("design:returntype", Promise)
], ViewGetRouter.prototype, "getObject", null);
__decorate([
    router_1.Get("/:view/:id/:attribute", auth_1.Authorization.ROUTE),
    __param(0, router_1.CurrentUser),
    __param(1, router_1.Path("view")),
    __param(2, router_1.Path("id")),
    __param(3, router_1.Path("attribute")),
    __param(4, router_1.Context()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_1.AbstractUser, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], ViewGetRouter.prototype, "getCollection", null);
__decorate([
    router_1.Get("/:view/:id/:attribute/:subId", auth_1.Authorization.ROUTE),
    __param(0, router_1.CurrentUser),
    __param(1, router_1.Path("view")),
    __param(2, router_1.Path("id")),
    __param(3, router_1.Path("attribute")),
    __param(4, router_1.Path("subId")),
    __param(5, router_1.Context()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_1.AbstractUser, String, String, Object, String, Object]),
    __metadata("design:returntype", Promise)
], ViewGetRouter.prototype, "getCollectionObject", null);
__decorate([
    router_1.Get("/model/:view", auth_1.Authorization.ROUTE),
    __param(0, router_1.CurrentUser),
    __param(1, router_1.Path("view")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_1.AbstractUser, String]),
    __metadata("design:returntype", Promise)
], ViewGetRouter.prototype, "getViewModel", null);
ViewGetRouter = __decorate([
    router_1.RouterModule("view")
], ViewGetRouter);
exports.default = ViewGetRouter;
//# sourceMappingURL=view-get.router.js.map