import {Body, Context, Controller, CurrentUser, Path, Post} from "../router";
import {ViewService} from "./service/view.service";
import {DataResponse, DataService} from "../data";
import {DataObject} from "../model";
import {AbstractUser} from "../auth";
import {RequestMethod} from "../router/enum/request-method.enum";
import {UnauthorizedError} from "../auth/error/unauthorized.error";
import {Dictionary} from "../../../base/type/dictionary.type";
import {EntityField} from "../model/interface/entity-field.class";
import {pick} from "lodash";
import {uuid} from "../../../base/type/uuid.type";
import {serializable} from "../../../base/type/serializable.type";
import {ModelService} from "../model/service/model.service";
import {CollectionField} from "../model/interface/collection-field.class";
import {CompositionField} from "../model/interface/composition-field.class";
import {PermissionService} from "../auth/service/permission.service";
import {Enemene} from "../../..";
import {AbstractController} from "../router/class/abstract-controller.class";
import {View} from "./class/view.class";

@Controller("view")
export default class ViewPostController extends AbstractController {

    private viewService: ViewService = Enemene.app.inject(ViewService);

    getView<ENTITY extends DataObject<ENTITY>>(viewName: string, user: AbstractUser): View<ENTITY> {
        Enemene.app.inject(PermissionService).checkViewPermission(viewName, RequestMethod.POST, user);
        return this.viewService.getViewNotNull(viewName);
    }

    @Post("/:view", true)
    async createObject<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                          @Path("view") viewName: string,
                                                          @Body() data: Dictionary<serializable>,
                                                          @Context() context: Dictionary<serializable>): Promise<DataResponse<ENTITY>> {
        const view: View<ENTITY> = this.getView(viewName, user);
        const fields: string[] = view.getFields();
        const filteredData: Dictionary<serializable> = pick(data, fields);

        let object = await DataService.create(view.entity(), filteredData, undefined, this.viewService.getFindOptions(view, ["*"], user, context));
        return {
            data: await this.viewService.findById(view, object.id, ["*"], user, context),
            model: view.getModel(),
        };
    }

    @Post("/:view/:id/:attribute", true)
    async createCollectionObject<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                                    @Path("view") viewName: string,
                                                                    @Path("id") objectId: uuid,
                                                                    @Path("attribute") collectionField: keyof ENTITY,
                                                                    @Body() data: Dictionary<serializable>,
                                                                    @Context() context: Dictionary<serializable>): Promise<DataResponse<ENTITY>> {
        const baseView: View<ENTITY> = this.getView(viewName, user);
        if (!baseView.$fields.find(field => field.name === collectionField)) {
            throw new UnauthorizedError();
        }

        const fields: string[] = baseView.getFields();

        const baseObject: DataObject<ENTITY> = await DataService.findNotNullById(baseView.entity(), objectId, this.viewService.getFindOptions(baseView, [collectionField as string], user, context));
        const baseModel: Dictionary<EntityField, keyof ENTITY> = ModelService.getFields(baseView.entity().name);

        const subFields: string[] = fields
            .filter(field => field.startsWith(`${String(collectionField)}.`))
            .map((field: string) => field.substr(field.indexOf(".") + 1));
        const filteredData: Dictionary<serializable> = pick(data, subFields);
        const fieldModel = baseModel[collectionField];

        let object: DataObject<ENTITY>;
        if (fieldModel instanceof CollectionField) {
            filteredData[fieldModel.foreignKey] = objectId;
            object = await DataService.create(fieldModel.classGetter(), filteredData);
            await baseObject.$add(fieldModel.name as any, object);
        } else if (fieldModel instanceof CompositionField) {
            filteredData[fieldModel.foreignKey] = objectId;
            object = await DataService.create(fieldModel.classGetter(), filteredData);
            await baseObject.$set(fieldModel.name as any, object);
        }

        return {
            data: object as Partial<ENTITY>,
            model: ModelService.getModel(object.$entity, subFields),
        };
    }
}
