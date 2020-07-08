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
exports.ModelRouter = void 0;
const router_module_decorator_1 = require("../router/decorator/router-module.decorator");
const get_decorator_1 = require("../router/decorator/get.decorator");
const authorization_enum_1 = require("../auth/enum/authorization.enum");
const enemene_1 = require("../application/enemene");
let ModelRouter = class ModelRouter {
    getAllEntites() {
        return __awaiter(this, void 0, void 0, function* () {
            return Object.keys(enemene_1.Enemene.app.db.models).filter(entity => entity !== "DataObject");
        });
    }
};
__decorate([
    get_decorator_1.Get("entities", authorization_enum_1.Authorization.PUBLIC),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ModelRouter.prototype, "getAllEntites", null);
ModelRouter = __decorate([
    router_module_decorator_1.RouterModule("model")
], ModelRouter);
exports.ModelRouter = ModelRouter;
//# sourceMappingURL=model.router.js.map