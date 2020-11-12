import {Redirect} from "./redirect.class";
import {CustomResponse} from "./custom-response.class";

export abstract class AbstractController {
    $path: string;

    protected redirect(url: string): Redirect {
        return new Redirect(url);
    }

    protected responseWithStatus<DATA>(status: number, data: DATA): CustomResponse<DATA> {
        return new CustomResponse(status, data);
    }
}
