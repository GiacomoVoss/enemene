import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUser} from "../../auth";
import {Dictionary, serializable} from "../../../../types/base";

export interface AfterUpdateHook {
    onAfterUpdate(context: RequestContext<AbstractUser>, oldValues: Dictionary<serializable>): Promise<void>;
}
