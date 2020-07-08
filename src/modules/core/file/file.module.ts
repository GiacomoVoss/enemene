import {Request, Response, Router} from "express";
import multer from "multer";
import * as path from "path";
import {View} from "../view";

export const identifier = "file";

const upload = multer({dest: path.join("tmp")});

export const router = () => {
    const _router = Router();

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
async function uploadFile(req: Request, res: Response, next: Function) {
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
}

/**
 * Delete a file by providing a {@link View} based on an {@link UploadFile} entity.
 * @param req
 * @param res
 * @param next
 */
async function deleteFile(req: Request, res: Response, next: Function) {
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
}

/**
 * Get a file by providing a {@link View} based on an {@link UploadFile} entity.
 * @param req
 * @param res
 * @param next
 */
async function getFile(req: Request, res: Response, next: Function) {
    // const view: View = ViewService.getViewNotNull(req.params.view);
    //
    // const object: DataObject<any> = await DataService.findNotNullByIdHandler(view.entity, req.params.id, req);
    //
    // res.download((object as any).file, (object as any).filename);
}
