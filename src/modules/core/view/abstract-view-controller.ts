import {AbstractController} from "../router";
import {DataObject} from "../model";
import {AbstractUser} from "../auth";
import {Enemene, ViewService} from "../../..";
import {PermissionService} from "../auth/service/permission.service";
import {RequestMethod} from "../router/enum/request-method.enum";
import {RequestContext} from "../router/interface/request-context.interface";
import {ViewDefinition} from "./class/view-definition.class";

export class AbstractViewController extends AbstractController {

    protected viewService: ViewService = Enemene.app.inject(ViewService);

    protected getViewDefinition<ENTITY extends DataObject<ENTITY>>(viewName: string, requestMethod: RequestMethod, context: RequestContext<AbstractUser>): ViewDefinition<ENTITY> {
        Enemene.app.inject(PermissionService).checkViewPermission(viewName, requestMethod, context);
        return this.viewService.getViewDefinition(viewName);
    }
}
