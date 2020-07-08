"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = exports.identifier = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path = __importStar(require("path"));
exports.identifier = "file";
const upload = multer_1.default({ dest: path.join("tmp") });
exports.router = () => {
    const _router = express_1.Router();
    // _router.post("/:view", authenticatedGuard, allowHeaders, upload.single("file"), uploadFile);
    // _router.get("/:view/:id", authenticatedOrPublicGuard, getFile);
    // _router.delete("/:view/:id", authenticatedGuard, deleteFile);
    return _router;
};
/**
 * Upload a file by providing a {@link View} based on an {@link UploadFile} entity.
 * @param req
 * @param res
 * @param next
 */
function uploadFile(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // const view: View = ViewService.getViewNotNull(req.params.view);
        //
        // const newFilePath = path.join(view.entity.name, req.file.filename);
        //
        // const object: DataObject<any> = await DataService.create(view.entity, {
        //     ...req.body,
        //     filename: req.file.originalname,
        //     size: req.file.size,
        //     file: newFilePath
        // });
        //
        // FileService.mkdirIfMissing(view.entity.name);
        //
        // await FileService.copyFile(req.file.path, newFilePath, true);
        //
        // const findOptions = {where: {}};
        //
        // view.entity.primaryKeyAttributes.forEach(attribute => findOptions.where[attribute] = object[attribute]);
        //
        // const newObject: DataObject<any> = await DataService.findNotNull(view.entity, req);
        //
        // if ((newObject as unknown as PostCreateHook).postCreate) {
        //     await (newObject as unknown as PostCreateHook).postCreate();
        // }
        //
        // return res.send(await ViewService.toJSON(newObject, view.fields));
    });
}
/**
 * Delete a file by providing a {@link View} based on an {@link UploadFile} entity.
 * @param req
 * @param res
 * @param next
 */
function deleteFile(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // const view: View = ViewService.getViewNotNull(req.params.view);
        //
        // const options: any = {};
        // if (view.filter) {
        //     options.where = view.filter;
        // }
        //
        // const object: DataObject<any> = await DataService.findNotNullByIdHandler(view.entity, req.params.id, req);
        //
        // if ((object as unknown as PreDeleteHook).preDelete) {
        //     await (object as unknown as PreDeleteHook).preDelete();
        // }
        //
        // const filePath: string = (object as any).file;
        //
        // await object.destroy();
        //
        // await FileService.deleteFile(filePath);
        //
        // return res.end();
    });
}
/**
 * Get a file by providing a {@link View} based on an {@link UploadFile} entity.
 * @param req
 * @param res
 * @param next
 */
function getFile(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // const view: View = ViewService.getViewNotNull(req.params.view);
        //
        // const object: DataObject<any> = await DataService.findNotNullByIdHandler(view.entity, req.params.id, req);
        //
        // res.download((object as any).file, (object as any).filename);
    });
}
//# sourceMappingURL=file.module.js.map