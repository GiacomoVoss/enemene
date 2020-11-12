import {Body, Context, Path, Put} from "../router";
import {DataObject} from "../model";
import {AbstractUser} from "../auth";
import {DataResponse, View} from "../../..";
import {Dictionary} from "../../../base/type/dictionary.type";
import {uuid} from "../../../base/type/uuid.type";
import {serializable} from "../../../base/type/serializable.type";
import {AbstractViewController} from "./abstract-view-controller";
import {RequestMethod} from "../router/enum/request-method.enum";
import {RequestContext} from "../router/interface/request-context.interface";
import {Controller} from "../router/decorator/controller.decorator";
import {ViewDefinition} from "./class/view-definition.class";

@Controller("view")
export default class ViewPutController extends AbstractViewController {

    @Put("/:view/:id", true)
    async updateObject<ENTITY extends DataObject<ENTITY>>(@Path("view") viewName: string,
                                                          @Path("id") objectId: uuid,
                                                          @Body() data: Dictionary<serializable>,
                                                          @Context() context: RequestContext<AbstractUser>): Promise<DataResponse<ENTITY>> {
        const viewDefinition: ViewDefinition<ENTITY> = this.getViewDefinition(viewName, RequestMethod.PUT, context);
        const view: View<ENTITY> = await this.viewService.findById(viewDefinition, objectId, context);
        view.setValues(data);

        return {
            data: await this.viewService.save(view, context),
            model: viewDefinition.getModel(),
        };
    }

}
