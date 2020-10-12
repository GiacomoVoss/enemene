import {Context, Controller, CurrentUser, Delete, Path} from "../router";
import {ViewService} from "./service/view.service";
import {DataService} from "../data";
import {DataObject} from "../model";
import {AbstractUser} from "../auth";
import {RequestMethod} from "../router/enum/request-method.enum";
import {uuid} from "../../../base/type/uuid.type";
import {Dictionary} from "../../../base/type/dictionary.type";
import {serializable} from "../../../base/type/serializable.type";
import {PermissionService} from "../auth/service/permission.service";
import {ObjectNotFoundError} from "../error/object-not-found.error";
import {EntityField} from "../model/interface/entity-field.class";
import {ModelService} from "../model/service/model.service";
import {RuntimeError} from "../application/error/runtime.error";
import {ReferenceField} from "../model/interface/reference-field.class";
import {Enemene} from "../../..";
import {AbstractController} from "../router/class/abstract-controller.class";
import {View} from "./class/view.class";

@Controller("view")
export default class ViewDeleteController extends AbstractController {

    private viewService: ViewService = Enemene.app.inject(ViewService);

    getView<ENTITY extends DataObject<ENTITY>>(viewName: string, user: AbstractUser): View<ENTITY> {
        Enemene.app.inject(PermissionService).checkViewPermission(viewName, RequestMethod.GET, user);
        return this.viewService.getViewNotNull(viewName);
    }

    @Delete("/:view/:id", true)
    async deleteObject<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                          @Path("view") viewName: string,
                                                          @Path("id") objectId: uuid,
                                                          @Context() context: Dictionary<serializable>): Promise<void> {
        const view: View<ENTITY> = this.getView(viewName, user);

        const object: DataObject<ENTITY> = await DataService.findNotNullById(view.entity(), objectId, this.viewService.getFindOptions(view, ["*"], user, context));

        await DataService.delete(view.entity(), object);
    }

    @Delete("/:view/:id/:attribute/:subId", true)
    async deleteCollectionObject<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                                    @Path("view") viewName: string,
                                                                    @Path("id") objectId: uuid,
                                                                    @Path("attribute") collectionField: keyof ENTITY,
                                                                    @Path("subId") subObjectId: uuid,
                                                                    @Context() context: Dictionary<serializable>): Promise<void> {
        const baseView: View<ENTITY> = this.getView(viewName, user);
        if (!baseView.$fields.find(field => field.name === collectionField)) {
            throw new ObjectNotFoundError();
        }
        const field: EntityField = ModelService.getFields<ENTITY>(baseView.entity().name)[collectionField];
        if (field.isSimpleField) {
            throw new RuntimeError(`Cannot delete simple data field "${collectionField}".`);
        }
        const baseObject: ENTITY = await DataService.findNotNullById(baseView.entity(), objectId, this.viewService.getFindOptions(baseView, [collectionField as string], user, context));
        const object: DataObject<any> = await DataService.findById((field as ReferenceField).classGetter(), subObjectId);
        if (object) {
            await baseObject.$remove(collectionField as string, subObjectId);
            await DataService.delete((field as ReferenceField).classGetter(), object);
        }
    }
}
