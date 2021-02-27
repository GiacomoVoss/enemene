import {Body, Context, Path, Put, Req} from "../router";
import {DataObject} from "../model";
import {AbstractUser, SecureRequest} from "../auth";
import {DataResponse, View} from "../../..";
import {Dictionary} from "../../../base/type/dictionary.type";
import {uuid} from "../../../base/type/uuid.type";
import {serializable} from "../../../base/type/serializable.type";
import {AbstractViewController} from "./abstract-view-controller";
import {RequestContext} from "../router/interface/request-context.interface";
import {Controller} from "../router/decorator/controller.decorator";
import {ViewDefinition} from "./class/view-definition.class";

@Controller("view")
export default class ViewPutController extends AbstractViewController {

    @Put("/:view/:id", true)
    async updateObject<ENTITY extends DataObject<ENTITY>>(@Path("view") viewName: string,
                                                          @Path("id") objectId: uuid,
                                                          @Body() data: Dictionary<serializable>,
                                                          @Context context: RequestContext<AbstractUser>): Promise<DataResponse<ENTITY>> {
        const viewDefinition: ViewDefinition<ENTITY> = this.getViewDefinition(viewName);
        const view: View<ENTITY> = await this.viewService.findById(viewDefinition.viewClass, objectId, context);
        view.setValues(data, context);

        return {
            data: await this.viewService.save(view, context),
            model: viewDefinition.getModel(context),
        };
    }

    @Put("/:view/:id/*", true)
    async updateByPath<ENTITY extends DataObject<ENTITY>>(@Path("view") viewName: string,
                                                          @Path("id") objectId: uuid,
                                                          @Req request: SecureRequest,
                                                          @Body() data: Dictionary<serializable>,
                                                          @Context context: RequestContext<AbstractUser>): Promise<DataResponse<ENTITY>> {

        const attributePath = request.params[0];
        if (!attributePath || !attributePath.length) {
            return this.updateObject(viewName, objectId, data, context);
        }

        const viewDefinition: ViewDefinition<ENTITY> = this.getViewDefinition(viewName);
        const rootObject: View<ENTITY> = await this.viewService.findById(viewDefinition.viewClass, objectId, context);

        let object = rootObject.getByPath(attributePath);

        if (object instanceof View) {
            object.setValues(data, context);
        } else {
            const subAttributePath: string[] = attributePath.split("/");
            const lastToken: string = subAttributePath.pop();
            object = rootObject.getByPath(subAttributePath.join("/"));
            object.setValues({
                [lastToken]: data,
            }, context);
        }

        await this.viewService.save(rootObject, context);

        return {
            data: (await this.viewService.findById(viewDefinition.viewClass, objectId, context)).getByPath(attributePath),
            model: viewDefinition.getModel(context),
        };
    }

}
