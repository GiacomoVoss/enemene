import {Redirect} from "./redirect.class";
import {CustomResponse} from "./custom-response.class";
import {FileResponse} from "./file-response.class";

export abstract class AbstractController {
    $path: string;

    protected redirect(url: string): Redirect {
        return new Redirect(url);
    }

    protected responseWithStatus<DATA>(status: number, data: DATA): CustomResponse<DATA> {
        return new CustomResponse(status, data);
    }

    protected returnFile(filePath: string, fileName: string): FileResponse {
        return new FileResponse(filePath, fileName);
    }
}
