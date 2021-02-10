import {AbstractController} from "../router";
import {DataObject} from "../model";
import {Enemene, ViewInitializerService, ViewService} from "../../..";
import {ViewDefinition} from "./class/view-definition.class";

export class AbstractViewController extends AbstractController {

    protected viewService: ViewService = Enemene.app.inject(ViewService);

    protected getViewDefinition<ENTITY extends DataObject<ENTITY>>(viewName: string): ViewDefinition<ENTITY> {
        return ViewInitializerService.getViewDefinition(viewName);
    }
}
