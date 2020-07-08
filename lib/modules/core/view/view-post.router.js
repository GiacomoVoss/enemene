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
const lodash_1 = require("lodash");
const model_service_1 = require("../model/service/model.service");
const collection_field_class_1 = require("../model/interface/collection-field.class");
const composition_field_class_1 = require("../model/interface/composition-field.class");
let ViewPostRouter = class ViewPostRouter {
    createObject(user, viewName, data, context) {
        return __awaiter(this, void 0, void 0, function* () {
            auth_1.PermissionService.checkViewPermission(viewName, request_method_enum_1.RequestMethod.POST, user);
            const view = view_service_1.ViewService.getViewNotNull(viewName);
            const fields = view_service_1.ViewService.getFields(view);
            const filteredData = lodash_1.pick(data, fields);
            const object = yield data_1.DataService.create(view.entity(), filteredData, undefined, view_service_1.ViewService.getFindOptions(view, user, context));
            const model = view_service_1.ViewService.getModelForView(view);
            return {
                data: object,
                model,
            };
        });
    }
    createCollectionObject(user, viewName, objectId, collectionField, data, context) {
        return __awaiter(this, void 0, void 0, function* () {
            auth_1.PermissionService.checkViewPermission(viewName, request_method_enum_1.RequestMethod.POST, user);
            const baseView = view_service_1.ViewService.getViewNotNull(viewName);
            if (!baseView.fields.find(field => field === collectionField || field.field === collectionField)) {
                throw new unauthorized_error_1.UnauthorizedError();
            }
            const fields = view_service_1.ViewService.getFields(baseView);
            const baseObject = yield data_1.DataService.findNotNullById(baseView.entity(), objectId, view_service_1.ViewService.getFindOptions(baseView, user, context));
            const baseModel = model_service_1.ModelService.getFields(baseView.entity().name);
            const subFields = fields
                .filter(field => field.startsWith(`${String(collectionField)}.`))
                .map((field) => field.substr(field.indexOf(".") + 1));
            const filteredData = lodash_1.pick(data, subFields);
            const fieldModel = baseModel[collectionField];
            console.log(subFields);
            console.log(filteredData);
            console.log(fieldModel);
            let object;
            if (fieldModel instanceof collection_field_class_1.CollectionField) {
                object = yield data_1.DataService.create(fieldModel.classGetter(), filteredData);
                yield baseObject.$add(fieldModel.name, object);
            }
            else if (fieldModel instanceof composition_field_class_1.CompositionField) {
                object = yield data_1.DataService.create(fieldModel.classGetter(), filteredData);
                yield baseObject.$set(fieldModel.name, object);
            }
            return {
                data: object,
                model: model_service_1.ModelService.getModel(object.$entity, subFields),
            };
        });
    }
};
__decorate([
    router_1.Post("/:view"),
    __param(0, router_1.CurrentUser),
    __param(1, router_1.Path("view")),
    __param(2, router_1.Body()),
    __param(3, router_1.Context()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_1.AbstractUser, String, Object, Object]),
    __metadata("design:returntype", Promise)
], ViewPostRouter.prototype, "createObject", null);
__decorate([
    router_1.Post("/:view/:id/:attribute"),
    __param(0, router_1.CurrentUser),
    __param(1, router_1.Path("view")),
    __param(2, router_1.Path("id")),
    __param(3, router_1.Path("attribute")),
    __param(4, router_1.Body()),
    __param(5, router_1.Context()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_1.AbstractUser, String, String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ViewPostRouter.prototype, "createCollectionObject", null);
ViewPostRouter = __decorate([
    router_1.RouterModule("view")
], ViewPostRouter);
exports.default = ViewPostRouter;
//# sourceMappingURL=view-post.router.js.map