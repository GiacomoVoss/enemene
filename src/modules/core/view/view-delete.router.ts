import {Context, CurrentUser, Delete, Path, RouterModule} from "../router";
import {ViewService} from "./service/view.service";
import {DataService} from "../data";
import {DataObject} from "../model";
import {AbstractUser} from "../auth";
import {RequestMethod} from "../router/enum/request-method.enum";
import {View, ViewFieldDefinition} from "./";
import {uuid} from "../../../base/type/uuid.type";
import {Dictionary} from "../../../base/type/dictionary.type";
import {serializable} from "../../../base/type/serializable.type";
import {PermissionService} from "../auth/service/permission.service";
import {ObjectNotFoundError} from "../error/object-not-found.error";
import {EntityField} from "../model/interface/entity-field.class";
import {ModelService} from "../model/service/model.service";
import {RuntimeError} from "../application/error/runtime.error";
import {ReferenceField} from "../model/interface/reference-field.class";

@RouterModule("view")
export default class ViewDeleteRouter {

    @Delete("/:view/:id", true)
    async deleteObject<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                          @Path("view") viewName: string,
                                                          @Path("id") objectId: uuid,
                                                          @Context() context: Dictionary<serializable>): Promise<void> {
        PermissionService.checkViewPermission(viewName, RequestMethod.DELETE, user);
        const view: View<any> = ViewService.getViewNotNull(viewName);

        const object: DataObject<ENTITY> = await DataService.findNotNullById(view.entity(), objectId, ViewService.getFindOptions(view, ["*"], user, context));

        object.destroy();
    }

    @Delete("/:view/:id/:attribute/:subId", true)
    async deleteCollectionObject<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                                    @Path("view") viewName: string,
                                                                    @Path("id") objectId: uuid,
                                                                    @Path("attribute") collectionField: keyof ENTITY,
                                                                    @Path("subId") subObjectId: uuid,
                                                                    @Context() context: Dictionary<serializable>): Promise<void> {
        PermissionService.checkViewPermission(viewName, RequestMethod.DELETE, user);

        const baseView: View<ENTITY> = ViewService.getViewNotNull(viewName);
        if (!baseView.fields.find(field => (field as string) === collectionField || (field as ViewFieldDefinition<ENTITY, any>).field === collectionField)) {
            throw new ObjectNotFoundError();
        }
        const field: EntityField = ModelService.getFields<ENTITY>(baseView.entity().name)[collectionField];
        if (field.isSimpleField) {
            throw new RuntimeError(`Cannot delete simple data field "${collectionField}".`);
        }
        const baseObject: ENTITY = await DataService.findNotNullById(baseView.entity(), objectId, ViewService.getFindOptions(baseView, [collectionField as string], user, context));
        const object: DataObject<any> = await DataService.findById((field as ReferenceField).classGetter(), subObjectId);
        if (object) {
            object.destroy();
            await baseObject.$remove(collectionField as string, subObjectId);
        }
    }
}
