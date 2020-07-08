import {Context, CurrentUser, Get, Path, Query, RouterModule} from "../router";
import {AbstractUser, Authorization, PermissionService} from "../auth";
import {ViewService} from "./service/view.service";
import {DataResponse, DataService} from "../data";
import {DataObject} from "../model";
import {RequestMethod} from "../router/enum/request-method.enum";
import {Order} from "sequelize";
import {View, ViewFieldDefinition} from "./";
import {UnauthorizedError} from "../auth/error/unauthorized.error";
import {Dictionary} from "../../../base/type/dictionary.type";
import {EntityField} from "../model/interface/entity-field.class";
import {uuid} from "../../../base/type/uuid.type";
import {serializable} from "../../../base/type/serializable.type";

@RouterModule("view")
export default class ViewGetRouter {

    @Get("/:view", Authorization.ROUTE)
    async getObjects<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                        @Path("view") viewName: string,
                                                        @Query("order") orderString: string,
                                                        @Context() context: Dictionary<serializable>): Promise<DataResponse<ENTITY>> {
        PermissionService.checkViewPermission(viewName, RequestMethod.GET, user);

        const view: View<ENTITY> = ViewService.getViewNotNull(viewName);
        const fields: string[] = ViewService.getFields(view);
        const order: Order | undefined = orderString ? ([orderString.split(":")] as Order) : undefined;

        const data: DataObject<ENTITY>[] = await DataService.findAll(view.entity(), ViewService.getFindOptions(view, user, context));
        const model = ViewService.getModelForView(view);
        return {
            data: await Promise.all(data.map((object: DataObject<ENTITY>) => DataService.filterFields(object, fields))) as Partial<ENTITY>[],
            model,
        };
    }

    @Get("/:view/:id", Authorization.ROUTE)
    async getObject<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                       @Path("view") viewName: string,
                                                       @Path("id") objectId: string,
                                                       @Context() context: Dictionary<serializable>): Promise<DataResponse<ENTITY>> {
        PermissionService.checkViewPermission(viewName, RequestMethod.GET, user);
        const view: View<ENTITY> = ViewService.getViewNotNull(viewName);
        const fields: string[] = ViewService.getFields(view);

        const data: DataObject<ENTITY> = await DataService.findNotNullById(view.entity(), objectId, ViewService.getFindOptions(view, user, context));
        const model = ViewService.getModelForView(view);
        return {
            data: await DataService.filterFields(data, fields) as Partial<ENTITY>,
            model,
        };
    }

    @Get("/:view/:id/:attribute", Authorization.ROUTE)
    async getCollection<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                           @Path("view") viewName: string,
                                                           @Path("id") objectId: string,
                                                           @Path("attribute") collectionField: keyof ENTITY,
                                                           @Context() context: Dictionary<serializable>): Promise<DataResponse<any>> {
        PermissionService.checkViewPermission(viewName, RequestMethod.GET, user);

        const baseView: View<ENTITY> = ViewService.getViewNotNull(viewName);
        if (!baseView.fields.find(field => (field as string) === collectionField || (field as ViewFieldDefinition<ENTITY, any>).field === collectionField)) {
            throw new UnauthorizedError();
        }

        const fields: string[] = ViewService.getFields(baseView);

        const data: DataObject<ENTITY> = await DataService.findNotNullById(baseView.entity(), objectId, ViewService.getFindOptions(baseView, user, context));
        const model = ViewService.getModelForView(baseView);

        const subFields: string[] = fields.filter(field => field.startsWith(`${String(collectionField)}.`));
        const subData: Partial<ENTITY> = await DataService.filterFields(data, subFields) as Partial<ENTITY>;
        return {
            data: subData[collectionField],
            model,
        };
    }

    @Get("/:view/:id/:attribute/:subId", Authorization.ROUTE)
    async getCollectionObject<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                                 @Path("view") viewName: string,
                                                                 @Path("id") objectId: uuid,
                                                                 @Path("attribute") collectionField: keyof ENTITY,
                                                                 @Path("subId") subObjectId: uuid,
                                                                 @Context() context: Dictionary<serializable>): Promise<DataResponse<any>> {
        PermissionService.checkViewPermission(viewName, RequestMethod.GET, user);

        const baseView: View<ENTITY> = ViewService.getViewNotNull(viewName);
        if (!baseView.fields.find(field => (field as string) === collectionField || (field as ViewFieldDefinition<ENTITY, any>).field === collectionField)) {
            throw new UnauthorizedError();
        }

        const fields: string[] = ViewService.getFields(baseView);

        const data: DataObject<ENTITY> = await DataService.findNotNullById(baseView.entity(), objectId, ViewService.getFindOptions(baseView, user, context));
        const model = ViewService.getModelForView(baseView);

        const subFields: string[] = fields.filter(field => field.startsWith(`${String(collectionField)}.`));
        const subData: Dictionary<any, keyof ENTITY> = await DataService.filterFields(data, subFields);

        let subObject: DataObject<any>;
        if (Array.isArray(subData[collectionField])) {
            subObject = (subData[collectionField] as DataObject<any>[]).find(object => object.id === subObjectId);
        } else {
            subObject = (subData[collectionField] as DataObject<any>).id === subObjectId ? subData[collectionField] : null;
        }

        return {
            data: subObject,
            model,
        };
    }

    @Get("/model/:view", Authorization.ROUTE)
    async getViewModel(@CurrentUser user: AbstractUser,
                       @Path("view") viewName: string): Promise<Dictionary<Dictionary<EntityField> | string>> {
        PermissionService.checkViewPermission(viewName, RequestMethod.GET, user);
        const view: View<any> = ViewService.getViewNotNull(viewName);

        return ViewService.getModelForView(view);
    }
}
