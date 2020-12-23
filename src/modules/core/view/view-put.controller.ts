import {Body, Context, Path, Put, Req} from "../router";
import {DataObject} from "../model";
import {AbstractUser, SecureRequest} from "../auth";
import {DataResponse, UuidService, View} from "../../..";
import {Dictionary} from "../../../base/type/dictionary.type";
import {uuid} from "../../../base/type/uuid.type";
import {serializable} from "../../../base/type/serializable.type";
import {AbstractViewController} from "./abstract-view-controller";
import {RequestMethod} from "../router/enum/request-method.enum";
import {RequestContext} from "../router/interface/request-context.interface";
import {Controller} from "../router/decorator/controller.decorator";
import {ViewDefinition} from "./class/view-definition.class";
import {InputValidationError} from "../validation/error/input-validation.error";
import {get} from "lodash";

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

    @Put("/:view/:id/*", true)
    async updateByPath<ENTITY extends DataObject<ENTITY>>(@Path("view") viewName: string,
                                                          @Path("id") objectId: uuid,
                                                          @Req request: SecureRequest,
                                                          @Body() data: Dictionary<serializable>,
                                                          @Context() context: RequestContext<AbstractUser>): Promise<DataResponse<ENTITY>> {

        const attributePath = request.params[0];
        if (!attributePath || !attributePath.length) {
            return this.updateObject(viewName, objectId, data, context);
        }
        const attributeTokens: string[] = attributePath.split("/");

        const viewDefinition: ViewDefinition<ENTITY> = this.getViewDefinition(viewName, RequestMethod.PUT, context);
        let object: View<ENTITY> = await this.viewService.findById(viewDefinition, objectId, context);

        for (const token of attributeTokens) {
            if (Array.isArray(object)) {
                if (UuidService.isUuid(token)) {
                    object = object.find((obj: any) => obj.id === token);
                } else if (!isNaN(Number.parseInt(token))) {
                    object = object[Number.parseInt(token)];
                } else {
                    throw new InputValidationError([{
                        type: "field",
                        field: "attributePath",
                        message: `Invalid attribute path: ${attributePath}`,
                    }]);
                }
            } else {
                object = get(object, token);
            }
        }

        if (!(object instanceof View)) {
            throw new InputValidationError([{
                type: "field",
                field: "attributePath",
                message: `Invalid attribute path: ${attributePath}`,
            }]);
        }

        object.setValues(data);

        return {
            data: await this.viewService.save(object, context),
            model: viewDefinition.getModel(),
        };
    }

}
