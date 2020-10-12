import {Redirect} from "./redirect.class";

export class AbstractController {
    $modulePath: string;

    protected redirect(url: string): Redirect {
        return new Redirect(url);
    }
}
