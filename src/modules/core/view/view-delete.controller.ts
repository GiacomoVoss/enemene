import {Body, Context, Delete, Path, Req} from "../router";
import {AbstractViewController} from "./abstract-view-controller";
import {DataObject} from "../model";
import {AbstractUser, SecureRequest} from "../auth";
import {uuid} from "../../../base/type/uuid.type";
import {DataService} from "../data";
import {RequestMethod} from "../router/enum/request-method.enum";
import {RequestContext} from "../router/interface/request-context.interface";
import {Controller} from "../router/decorator/controller.decorator";
import {ViewDefinition} from "./class/view-definition.class";
import {Dictionary} from "../../../base/type/dictionary.type";
import {serializable} from "../../../base/type/serializable.type";
import {View} from "./class/view.class";
import {InvalidAttributePathError} from "./error/invalid-attribute-path.error";
import {ViewFieldDefinition} from "./interface/view-field-definition.interface";

@Controller("view")
export default class ViewDeleteController extends AbstractViewController {

    @Delete("/:view/:id", true)
    async deleteObject<ENTITY extends DataObject<ENTITY>>(@Path("view") viewName: string,
                                                          @Path("id") objectId: uuid,
                                                          @Context() context: RequestContext<AbstractUser>): Promise<void> {
        const viewDefinition: ViewDefinition<ENTITY> = this.getViewDefinition(viewName, RequestMethod.DELETE, context);

        const object: DataObject<ENTITY> = await DataService.findNotNullById(viewDefinition.entity, objectId, this.viewService.getFindOptions(viewDefinition, context));

        await DataService.delete(object, context);
    }

    @Delete("/:view/:id/*", true)
    async deleteInPath<ENTITY extends DataObject<ENTITY>>(@Path("view") viewName: string,
                                                          @Path("id") objectId: uuid,
                                                          @Req request: SecureRequest,
                                                          @Body() data: Dictionary<serializable>,
                                                          @Context() context: RequestContext<AbstractUser>): Promise<void> {

        const attributePath = request.params[0];
        if (!attributePath || !attributePath.length) {
            return this.deleteObject(viewName, objectId, context);
        }
        const attributeTokens: string[] = attributePath.split("/");
        const collectionObjectId: string = attributeTokens.pop();
        const collectionAttribute: string = attributeTokens.pop();

        const viewDefinition: ViewDefinition<ENTITY> = this.getViewDefinition(viewName, RequestMethod.DELETE, context);
        let object: View<ENTITY> = await this.viewService.findById(viewDefinition, objectId, context);
        object = object.getByPath(attributeTokens.join("/"));

        const collectionViewField: ViewFieldDefinition<any, any> | undefined = object.$view.fields.find(viewField => viewField.isArray && viewField.name === collectionAttribute);

        if (!collectionViewField) {
            throw new InvalidAttributePathError(attributePath);
        }

        object.setValues({
            ...object,
            [collectionAttribute]: (object[collectionAttribute] ?? [])
                .filter(o => o.id !== collectionObjectId),
        });

        await this.viewService.save(object, context);
    }
}
