import {AbstractController, Controller, Get, Path} from "../router";
import {uuid} from "../../../base/type/uuid.type";
import {DocumentService} from "./service/document.service";
import {Enemene} from "../application";
import {FileResponse} from "../router/class/file-response.class";
import {GeneratedDocument} from "./interface/generated-document.interface";

@Controller("document")
export class DocumentController extends AbstractController {

    private documentService: DocumentService = Enemene.app.inject(DocumentService);

    @Get("download/:id", true)
    async download(@Path("id") id: uuid): Promise<FileResponse> {
        const document: GeneratedDocument = this.documentService.getGeneratedDocument(id);
        if (document) {
            return this.returnFile(document.file, document.fileName);
        }
    }
}