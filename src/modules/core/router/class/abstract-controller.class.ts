import {Redirect} from "./redirect.class";
import {CustomResponse} from "./custom-response.class";
import {FileResponse} from "./file-response.class";
import {Dictionary} from "../../../../base/type/dictionary.type";

export abstract class AbstractController {
    $path: string;

    protected redirect(url: string): Redirect {
        return new Redirect(url);
    }

    protected responseWithStatus<DATA>(status: number, data: DATA, headers?: Dictionary<string>): CustomResponse<DATA> {
        return new CustomResponse(status, data, headers);
    }

    protected returnFile(filePath: string, fileName: string): FileResponse {
        return new FileResponse(filePath, fileName);
    }
}
