import {Context, Delete, Path} from "../router";
import {AbstractViewController} from "./abstract-view-controller";
import {DataObject} from "../model";
import {AbstractUser} from "../auth";
import {uuid} from "../../../base/type/uuid.type";
import {DataService} from "../data";
import {RequestMethod} from "../router/enum/request-method.enum";
import {RequestContext} from "../router/interface/request-context.interface";
import {Controller} from "../router/decorator/controller.decorator";
import {ViewDefinition} from "./class/view-definition.class";

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

    //
    // @Delete("/:view/:id/:attribute/:subId", true)
    // async deleteCollectionObject<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
    //                                                                 @Path("view") viewName: string,
    //                                                                 @Path("id") objectId: uuid,
    //                                                                 @Path("attribute") collectionField: keyof ENTITY,
    //                                                                 @Path("subId") subObjectId: uuid,
    //                                                                 @Context() context: Dictionary<serializable>): Promise<void> {
    //     const baseView: View<ENTITY> = this.getViewDefinition(viewName, user);
    //     if (!baseView.$fields.find(field => field.name === collectionField)) {
    //         throw new ObjectNotFoundError();
    //     }
    //     const field: EntityField = ModelService.getFields<ENTITY>(baseView.entity().name)[collectionField];
    //     if (field.isSimpleField) {
    //         throw new RuntimeError(`Cannot delete simple data field "${collectionField}".`);
    //     }
    //     const baseObject: ENTITY = await DataService.findNotNullById(baseView.entity(), objectId, this.viewService.getFindOptions(baseView, [collectionField as string], user, context));
    //     const object: DataObject<any> = await DataService.findById((field as ReferenceField).classGetter(), subObjectId);
    //     if (object) {
    //         await baseObject.$remove(collectionField as string, subObjectId);
    //         await DataService.delete((field as ReferenceField).classGetter(), object);
    //     }
    // }
}
