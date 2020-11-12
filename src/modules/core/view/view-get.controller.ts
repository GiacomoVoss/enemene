import {Context, Get, Path, Query} from "../router";
import {AbstractUser} from "../auth";
import {DataResponse, DataService} from "../data";
import {DataObject} from "../model";
import {RequestMethod} from "../router/enum/request-method.enum";
import {ViewFieldDefinition} from "./";
import {Dictionary} from "../../../base/type/dictionary.type";
import {serializable} from "../../../base/type/serializable.type";
import {ObjectNotFoundError} from "../error/object-not-found.error";
import {Header, HttpHeader} from "../router/decorator/parameter/header.decorator";
import {ModelService} from "../model/service/model.service";
import {View} from "./class/view.class";
import {AbstractViewController} from "./abstract-view-controller";
import {ReferenceField} from "../model/interface/reference-field.class";
import {UnsupportedOperationError} from "../error/unsupported-operation.error";
import {RequestContext} from "../router/interface/request-context.interface";
import {Controller} from "../router/decorator/controller.decorator";
import {ViewDefinition} from "./class/view-definition.class";

@Controller("view")
export default class ViewGetController extends AbstractViewController {

    @Get("/count/:view", true)
    async countObjects<ENTITY extends DataObject<ENTITY>>(@Path("view") viewName: string,
                                                          @Query("search") search: string,
                                                          @Context() context: RequestContext<AbstractUser>): Promise<object> {
        const viewDefinition: ViewDefinition<ENTITY> = this.getViewDefinition(viewName, RequestMethod.GET, context);

        return {
            data: {
                count: await this.viewService.count(viewDefinition, context),
            },
        };
    }

    @Get("/:view", true)
    async getObjects<ENTITY extends DataObject<ENTITY>>(@Path("view") viewName: string,
                                                        @Query("fields") requestedFields: string,
                                                        @Query("order") order: string,
                                                        @Query("limit") limit: string,
                                                        @Query("offset") offset: string,
                                                        @Query("search") search: string,
                                                        @Context() context: RequestContext<AbstractUser>,
                                                        @Header(HttpHeader.LANGUAGE) language: string): Promise<DataResponse<ENTITY>> {
        const viewDefinition: ViewDefinition<ENTITY> = this.getViewDefinition(viewName, RequestMethod.GET, context);
        return {
            data: await this.viewService.findAll(viewDefinition, context, DataService.getFindOptions(order, limit, offset), search),
            model: viewDefinition.getModel(language),
            actions: viewDefinition.getActionConfigurations(),
        };
    }

    @Get("/:view/:id", true)
    async getObject<ENTITY extends DataObject<ENTITY>>(@Path("view") viewName: string,
                                                       @Path("id") objectId: string,
                                                       @Query("fields") requestedFields: string,
                                                       @Context() context: RequestContext<AbstractUser>): Promise<DataResponse<ENTITY>> {
        const viewDefinition: ViewDefinition<ENTITY> = this.getViewDefinition(viewName, RequestMethod.GET, context);
        return {
            data: await this.viewService.findById(viewDefinition, objectId, context),
            model: viewDefinition.getModel(),
            actions: viewDefinition.getActionConfigurations(),
        };
    }

    @Get("/:view/:id/:attribute", true)
    async getCollection<ENTITY extends DataObject<ENTITY>>(@Path("view") viewName: string,
                                                           @Path("id") objectId: string,
                                                           @Path("attribute") collectionField: keyof View<ENTITY>,
                                                           @Query("fields") requestedFields: string,
                                                           @Context() context: Dictionary<serializable>): Promise<DataResponse<any>> {
        const viewDefinition: ViewDefinition<ENTITY> = this.getViewDefinition(viewName, RequestMethod.GET, context);
        if (!viewDefinition.fields.find(field => field.name === collectionField)) {
            throw new ObjectNotFoundError();
        }

        const view: View<ENTITY> = await this.viewService.findById(viewDefinition, objectId, context);

        return {
            data: view[collectionField] as any,
            model: viewDefinition.getModel(),
        };
    }

    //
    // @Get("/:view/:id/:attribute/:subId", true)
    // async getCollectionObject<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
    //                                                              @Path("view") viewName: string,
    //                                                              @Path("id") objectId: uuid,
    //                                                              @Path("attribute") collectionField: keyof ENTITY,
    //                                                              @Path("subId") subObjectId: uuid,
    //                                                              @Query("fields") requestedFields: string,
    //                                                              @Context() context: Dictionary<serializable>): Promise<DataResponse<any>> {
    //     const baseView: View<ENTITY> = this.getViewDefinition(viewName, user);
    //
    //     if (!baseView.$fields.find(field => field.name === collectionField)) {
    //         throw new UnauthorizedError();
    //     }
    //
    //     const fields = this.viewService.getRequestedFields(requestedFields).map((field: string) => `${collectionField}.${field}`);
    //
    //     const data: DataObject<ENTITY> = await DataService.findNotNullById(baseView.entity(), objectId, this.viewService.getFindOptions(baseView, fields, user, context));
    //     const model = baseView.getModel();
    //
    //     const subData: Dictionary<any, keyof ENTITY> = await DataService.filterFields(data, fields);
    //
    //     let subObject: DataObject<any>;
    //     if (Array.isArray(subData[collectionField])) {
    //         subObject = (subData[collectionField] as DataObject<any>[]).find(object => object.id === subObjectId);
    //     } else {
    //         subObject = (subData[collectionField] as DataObject<any>).id === subObjectId ? subData[collectionField] : null;
    //     }
    //
    //     return {
    //         data: subObject,
    //         model,
    //     };
    // }

    @Get("/model/:view", true)
    async getViewModel(@Context() context: RequestContext<AbstractUser>,
                       @Path("view") viewName: string): Promise<Dictionary<serializable>> {
        const viewDefinition: ViewDefinition<any> = this.getViewDefinition(viewName, RequestMethod.GET, context);
        return viewDefinition.getModel();
    }

    @Get("/allowedValues/:view/:attribute", true)
    async getAllowedValues<ENTITY extends DataObject<ENTITY>, SUBENTITY extends DataObject<SUBENTITY>>(@Path("view") viewName: string,
                                                                                                       @Path("attribute") collectionField: keyof ENTITY,
                                                                                                       @Context() context: RequestContext<AbstractUser>): Promise<DataResponse<any>> {

        const viewDefinition: ViewDefinition<ENTITY> = this.getViewDefinition(viewName, RequestMethod.GET, context);

        const collectionViewField: ViewFieldDefinition<ENTITY, SUBENTITY> | undefined = viewDefinition.fields
            .find((field: ViewFieldDefinition<ENTITY, SUBENTITY>) => field.name === collectionField);

        if (!collectionViewField) {
            throw new ObjectNotFoundError();
        }

        const entityField: ReferenceField = ModelService.getFields(viewDefinition.entity.name)[collectionField as string];

        if (!(entityField instanceof ReferenceField)) {
            throw new UnsupportedOperationError("Cannot get allowed values.");
        }

        const object: ENTITY = new (viewDefinition.entity)();

        const allowedValues: DataResponse<SUBENTITY[]> = await ModelService.getAllowedValues(object, collectionViewField.name as keyof ENTITY, context);
        const subViewDefinition: ViewDefinition<SUBENTITY> = this.viewService.getSelectionViewDefinition(entityField.classGetter());
        return {
            data: allowedValues.data.map((o: SUBENTITY) => this.viewService.wrap(o, subViewDefinition)),
            model: allowedValues.model,
        };
    }
}
