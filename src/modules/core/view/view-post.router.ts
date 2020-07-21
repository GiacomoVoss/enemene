import {Body, Context, CurrentUser, Path, Post, RouterModule} from "../router";
import {ViewService} from "./service/view.service";
import {DataResponse, DataService} from "../data";
import {DataObject} from "../model";
import {AbstractUser} from "../auth";
import {RequestMethod} from "../router/enum/request-method.enum";
import {View, ViewFieldDefinition} from "./";
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

@RouterModule("view")
export default class ViewPostRouter {

    @Post("/:view")
    async createObject<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                          @Path("view") viewName: string,
                                                          @Body() data: Dictionary<serializable>,
                                                          @Context() context: Dictionary<serializable>): Promise<DataResponse<ENTITY>> {
        PermissionService.checkViewPermission(viewName, RequestMethod.POST, user);
        const view: View<any> = ViewService.getViewNotNull(viewName);
        const fields: string[] = ViewService.getFields(view);
        const filteredData: Dictionary<serializable> = pick(data, fields);

        const object: DataObject<ENTITY> = await DataService.create(view.entity(), filteredData, undefined, ViewService.getFindOptions(view, user, context));
        const model = ViewService.getModelForView(view);

        return {
            data: object as Partial<ENTITY>,
            model,
        };
    }

    @Post("/:view/:id/:attribute")
    async createCollectionObject<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                                    @Path("view") viewName: string,
                                                                    @Path("id") objectId: uuid,
                                                                    @Path("attribute") collectionField: keyof ENTITY,
                                                                    @Body() data: Dictionary<serializable>,
                                                                    @Context() context: Dictionary<serializable>): Promise<DataResponse<ENTITY>> {
        PermissionService.checkViewPermission(viewName, RequestMethod.POST, user);

        const baseView: View<ENTITY> = ViewService.getViewNotNull(viewName);
        if (!baseView.fields.find(field => (field as string) === collectionField || (field as ViewFieldDefinition<ENTITY, any>).field === collectionField)) {
            throw new UnauthorizedError();
        }

        const fields: string[] = ViewService.getFields(baseView);

        const baseObject: DataObject<ENTITY> = await DataService.findNotNullById(baseView.entity(), objectId, ViewService.getFindOptions(baseView, user, context));
        const baseModel: Dictionary<EntityField, keyof ENTITY> = ModelService.getFields(baseView.entity().name);

        const subFields: string[] = fields
            .filter(field => field.startsWith(`${String(collectionField)}.`))
            .map((field: string) => field.substr(field.indexOf(".") + 1));
        const filteredData: Dictionary<serializable> = pick(data, subFields);
        const fieldModel = baseModel[collectionField];

        let object: DataObject<ENTITY>;
        if (fieldModel instanceof CollectionField) {
            object = await DataService.create(fieldModel.classGetter(), filteredData);
            await baseObject.$add(fieldModel.name as any, object);
        } else if (fieldModel instanceof CompositionField) {
            object = await DataService.create(fieldModel.classGetter(), filteredData);
            await baseObject.$set(fieldModel.name as any, object);
        }

        return {
            data: object as Partial<ENTITY>,
            model: ModelService.getModel(object.$entity, subFields),
        };
    }
}
