import {AbstractController, Controller, Req} from "../router";
import {FileService} from "./service/file.service";
import {File} from "./model/file.model";
import {Enemene} from "../application";
import {SecureRequest} from "../auth";
import {UuidService} from "../service/uuid.service";
import path from "path";
import {PostFile} from "../router/decorator/post-file.decorator";

@Controller("file")
export class FileController extends AbstractController {

    private fileService: FileService = Enemene.app.inject(FileService);

    @PostFile("/")
    async uploadFile(@Req request: SecureRequest) {
        console.log(request);
        const fileId: string = UuidService.getUuid();
        const file: File = File.build({
            id: fileId,
            originalName: request.file.filename,
            size: request.file.size
        });
        const newFilePath = path.join(Enemene.app.config.dataPath, fileId);

        await this.fileService.copyFile(request.file.path, newFilePath);
        await file.save();

        return fileId;
    }
}