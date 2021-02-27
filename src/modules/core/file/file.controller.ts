import {AbstractController, Context, Controller, Req, UnrestrictedRequestContext} from "../router";
import {FileService} from "./service/file.service";
import {Enemene} from "../application";
import {AbstractUser, SecureRequest} from "../auth";
import {PostFile} from "../router/decorator/post-file.decorator";
import {UuidService} from "../service/uuid.service";
import {File} from "./model/file.model";
import {pick} from "lodash";
import {DataFileService} from "./service/data-file.service";
import {RequestContext} from "../router/interface/request-context.interface";

@Controller("file")
export class FileController extends AbstractController {

    private fileService: FileService = Enemene.app.inject(FileService);
    private dataFileService: DataFileService = Enemene.app.inject(DataFileService);

    @PostFile("/")
    async uploadFile(@Req request: SecureRequest,
                     @Context context: RequestContext<AbstractUser>) {
        const fileId: string = UuidService.getUuid();
        const file: File = File.build({
            id: fileId,
            originalName: request.file.originalname,
            size: request.file.size,
            temporary: true,
            uploadedById: context.currentUser.id,
        });

        return UnrestrictedRequestContext.create(async UNRESTRICTED => {
            await file.save({transaction: UNRESTRICTED.transaction});
            const newFilePath = this.dataFileService.getIndexedFilePath(file.id, true);
            await this.fileService.copyFile(request.file.path, newFilePath);
            return pick(file.toJSON(), "id", "originalName", "size");
        });
    }
}