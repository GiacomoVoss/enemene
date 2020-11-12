import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUser} from "../../auth";

export interface BeforeDeleteHook {
    onBeforeDelete(context: RequestContext<AbstractUser>): Promise<void>;
}
