import {Body, Context, Path, Post, Req} from "../router";
import {DataObject} from "../model";
import {AbstractUser, DataResponse, SecureRequest, UuidService, View, ViewFieldDefinition} from "../../..";
import {Dictionary} from "../../../base/type/dictionary.type";
import {serializable} from "../../../base/type/serializable.type";
import {AbstractViewController} from "./abstract-view-controller";
import {Controller} from "../router/decorator/controller.decorator";
import {ViewDefinition} from "./class/view-definition.class";
import {uuid} from "../../../enemene";
import {get} from "lodash";
import {RequestContext} from "../router/interface/request-context.interface";
import {InvalidAttributePathError} from "./error/invalid-attribute-path.error";

@Controller("view")
export default class ViewPostController extends AbstractViewController {

    @Post("/:view", true)
    async createObject<ENTITY extends DataObject<ENTITY>>(@Path("view") viewName: string,
                                                          @Body() data: Dictionary<serializable>,
                                                          @Context context: RequestContext<AbstractUser>): Promise<DataResponse<ENTITY>> {
        const viewDefinition: ViewDefinition<ENTITY> = this.getViewDefinition(viewName);
        const view = new viewDefinition.viewClass();
        view.setValues(data, context);
        const savedData: View<ENTITY> = await this.viewService.save(view, context);

        return {
            data: savedData,
            model: viewDefinition.getModel(),
        };
    }

    @Post("/:view/:id/*", true)
    async createInPath<ENTITY extends DataObject<ENTITY>>(@Path("view") viewName: string,
                                                          @Path("id") objectId: uuid,
                                                          @Req request: SecureRequest,
                                                          @Body() data: Dictionary<serializable>,
                                                          @Context context: RequestContext<AbstractUser>): Promise<DataResponse<ENTITY>> {

        const attributePath = request.params[0];
        if (!attributePath || !attributePath.length) {
            return this.createObject(viewName, data, context);
        }
        const attributeTokens: string[] = attributePath.split("/");
        const collectionAttribute: string = attributeTokens.pop();

        const viewDefinition: ViewDefinition<ENTITY> = this.getViewDefinition(viewName);
        let object: View<ENTITY> = await this.viewService.findById(viewDefinition.viewClass, objectId, context);
        for (const token of attributeTokens) {
            if (Array.isArray(object)) {
                if (UuidService.isUuid(token)) {
                    object = object.find((obj: any) => obj.id === token);
                } else if (!isNaN(Number.parseInt(token))) {
                    object = object[Number.parseInt(token)];
                } else {
                    throw new InvalidAttributePathError(attributePath);
                }
            } else {
                object = get(object, token);
            }
        }


        if (!(object instanceof View)) {
            throw new InvalidAttributePathError(attributePath);
        }

        const collectionViewField: ViewFieldDefinition<any, any> | undefined = object.$view.fields.find(viewField => viewField.isArray && viewField.name === collectionAttribute);

        if (!collectionViewField) {
            throw new InvalidAttributePathError(attributePath);
        }

        const newSubView: View<any> = new collectionViewField.subView();
        newSubView.setValues({
            ...data,
        }, context);
        object.setValues({
            ...object,
            [collectionAttribute]: [
                ...(object[collectionAttribute] ?? []),
                newSubView,
            ],
        }, context);

        const rootObject = await this.viewService.save(object, context);
        return {
            data: rootObject.getByPath(`${attributePath}/${newSubView.id}`),
            model: viewDefinition.getModel(),
        };
    }
}
