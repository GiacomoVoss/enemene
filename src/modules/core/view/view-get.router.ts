import {Context, CurrentUser, Get, Path, Query, RouterModule} from "../router";
import {AbstractUser} from "../auth";
import {ViewService} from "./service/view.service";
import {DataResponse, DataService} from "../data";
import {DataObject} from "../model";
import {RequestMethod} from "../router/enum/request-method.enum";
import {View, ViewFieldDefinition} from "./";
import {UnauthorizedError} from "../auth/error/unauthorized.error";
import {Dictionary} from "../../../base/type/dictionary.type";
import {EntityField} from "../model/interface/entity-field.class";
import {uuid} from "../../../base/type/uuid.type";
import {serializable} from "../../../base/type/serializable.type";
import {PermissionService} from "../auth/service/permission.service";
import {intersection} from "lodash";
import {FindOptions} from "sequelize";
import {ObjectNotFoundError} from "../error/object-not-found.error";

@RouterModule("view")
export default class ViewGetRouter {

    @Get("/count/:view", true)
    async countObjects<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                          @Path("view") viewName: string,
                                                          @Context() context: Dictionary<serializable>): Promise<{ data: number }> {
        PermissionService.checkViewPermission(viewName, RequestMethod.GET, user);
        const view: View<ENTITY> = ViewService.getViewNotNull(viewName);
        return {
            data: await DataService.count(view.entity(), ViewService.getFindOptions(view, user, context)),
        };
    }

    @Get("/:view", true)
    async getObjects<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                        @Path("view") viewName: string,
                                                        @Query("fields") requestedFields: string = "*",
                                                        @Query("order") order: string,
                                                        @Query("limit") limit: string,
                                                        @Query("offset") offset: string,
                                                        @Context() context: Dictionary<serializable>): Promise<DataResponse<ENTITY>> {
        PermissionService.checkViewPermission(viewName, RequestMethod.GET, user);
        const view: View<ENTITY> = ViewService.getViewNotNull(viewName);
        const findOptions: FindOptions = ViewService.getFindOptions(view, user, context, DataService.getFindOptions(order, limit, offset));
        return ViewService.findAllByView(view, requestedFields, user, context, findOptions);
    }

    @Get("/:view/:id", true)
    async getObject<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                       @Path("view") viewName: string,
                                                       @Path("id") objectId: string,
                                                       @Query("fields") requestedFields: string,
                                                       @Context() context: Dictionary<serializable>): Promise<DataResponse<ENTITY>> {
        PermissionService.checkViewPermission(viewName, RequestMethod.GET, user);
        const view: View<ENTITY> = ViewService.getViewNotNull(viewName);
        return ViewService.findByIdByView(view, objectId, requestedFields, user, context);
    }

    @Get("/:view/:id/:attribute", true)
    async getCollection<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                           @Path("view") viewName: string,
                                                           @Path("id") objectId: string,
                                                           @Path("attribute") collectionField: keyof ENTITY,
                                                           @Query("fields") requestedFields: string,
                                                           @Context() context: Dictionary<serializable>): Promise<DataResponse<any>> {
        PermissionService.checkViewPermission(viewName, RequestMethod.GET, user);

        const baseView: View<ENTITY> = ViewService.getViewNotNull(viewName);
        if (!baseView.fields.find(field => (field as string) === collectionField || (field as ViewFieldDefinition<ENTITY, any>).field === collectionField)) {
            throw new UnauthorizedError();
        }

        const fields: string[] = ViewService.getFields(baseView);

        const data: DataObject<ENTITY> = await DataService.findNotNullById(baseView.entity(), objectId, ViewService.getFindOptions(baseView, user, context));
        const model = ViewService.getModelForView(baseView);

        let subFields: string[] = fields.filter(field => field.startsWith(`${String(collectionField)}.`));
        if (requestedFields) {
            const requestedSubFields = requestedFields.split(",").map(f => `${String(collectionField)}.${f}`);
            subFields = intersection(subFields, requestedSubFields);
        }
        const subData: Partial<ENTITY> = await DataService.filterFields(data, subFields) as Partial<ENTITY>;
        return {
            data: subData[collectionField],
            model,
        };
    }

    @Get("/:view/:id/:attribute/:subId", true)
    async getCollectionObject<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                                 @Path("view") viewName: string,
                                                                 @Path("id") objectId: uuid,
                                                                 @Path("attribute") collectionField: keyof ENTITY,
                                                                 @Path("subId") subObjectId: uuid,
                                                                 @Query("fields") requestedFields: string,
                                                                 @Context() context: Dictionary<serializable>): Promise<DataResponse<any>> {
        PermissionService.checkViewPermission(viewName, RequestMethod.GET, user);

        const baseView: View<ENTITY> = ViewService.getViewNotNull(viewName);
        if (!baseView.fields.find(field => (field as string) === collectionField || (field as ViewFieldDefinition<ENTITY, any>).field === collectionField)) {
            throw new UnauthorizedError();
        }

        const fields: string[] = ViewService.getFields(baseView);

        const data: DataObject<ENTITY> = await DataService.findNotNullById(baseView.entity(), objectId, ViewService.getFindOptions(baseView, user, context));
        const model = ViewService.getModelForView(baseView);

        let subFields: string[] = fields.filter(field => field.startsWith(`${String(collectionField)}.`));
        if (requestedFields) {
            const requestedSubFields = requestedFields.split(",").map(f => `${String(collectionField)}.${f}`);
            subFields = intersection(subFields, requestedSubFields);
        }
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

    @Get("/model/:view", true)
    async getViewModel(@CurrentUser user: AbstractUser,
                       @Path("view") viewName: string): Promise<Dictionary<Dictionary<EntityField> | string>> {
        PermissionService.checkViewPermission(viewName, RequestMethod.GET, user);
        const view: View<any> = ViewService.getViewNotNull(viewName);

        return ViewService.getModelForView(view);
    }

    @Get("/allowedValues/:view/:attribute", true)
    async getAllowedValuesForObject<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                                       @Path("view") viewName: string,
                                                                       @Path("attribute") collectionField: keyof ENTITY,
                                                                       @Context() context: Dictionary<serializable>): Promise<DataResponse<any>> {
        PermissionService.checkViewPermission(viewName, RequestMethod.GET, user);

        const baseView: View<ENTITY> = ViewService.getViewNotNull(viewName);
        const collectionFieldDefinition: ViewFieldDefinition<ENTITY, any> | undefined = baseView.fields
            .filter(field => typeof field !== "string")
            .find((field: ViewFieldDefinition<ENTITY, any>) => field.field === collectionField) as ViewFieldDefinition<ENTITY, any>;

        if (!collectionFieldDefinition || !collectionFieldDefinition.allowedValuesView) {
            throw new ObjectNotFoundError();
        }

        const view: View<any> = collectionFieldDefinition.view;
        const fields: string[] = ViewService.getFields(view);
        const data: DataObject<ENTITY>[] = await DataService.findAll(view.entity(), ViewService.getFindOptions(view, user, context));
        const model = ViewService.getModelForView(view);
        return {
            data: await Promise.all(data.map((object: DataObject<any>) => DataService.filterFields(object, fields))) as Partial<any>[],
            model,
        };
    }
}
