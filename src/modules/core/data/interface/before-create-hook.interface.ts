import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUser} from "../../auth";

export interface BeforeCreateHook {
    onBeforeCreate(context: RequestContext<AbstractUser>): Promise<void>;
}
