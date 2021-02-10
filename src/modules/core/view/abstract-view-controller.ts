import {AbstractController} from "../router";
import {DataObject} from "../model";
import {Enemene, ViewInitializerService, ViewService} from "../../..";
import {ViewDefinition} from "./class/view-definition.class";
import {ViewHelperService} from "./service/view-helper.service";

export class AbstractViewController extends AbstractController {

    protected viewService: ViewService = Enemene.app.inject(ViewService);
    protected viewHelperService: ViewHelperService = Enemene.app.inject(ViewHelperService);

    protected getViewDefinition<ENTITY extends DataObject<ENTITY>>(viewName: string): ViewDefinition<ENTITY> {
        return ViewInitializerService.getViewDefinition(viewName);
    }
}
