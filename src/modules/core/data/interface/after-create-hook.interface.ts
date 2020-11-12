import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUser} from "../../auth";

export interface AfterCreateHook {
    onAfterCreate(context: RequestContext<AbstractUser>): Promise<void>;
}
