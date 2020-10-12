import {Context, Controller, CurrentUser, Get, Path, Query} from "../router";
import {AbstractUser} from "../auth";
import {ViewService} from "./service/view.service";
import {DataResponse, DataService} from "../data";
import {DataObject} from "../model";
import {RequestMethod} from "../router/enum/request-method.enum";
import {ViewFieldDefinition} from "./";
import {UnauthorizedError} from "../auth/error/unauthorized.error";
import {Dictionary} from "../../../base/type/dictionary.type";
import {uuid} from "../../../base/type/uuid.type";
import {serializable} from "../../../base/type/serializable.type";
import {PermissionService} from "../auth/service/permission.service";
import {ObjectNotFoundError} from "../error/object-not-found.error";
import {Header, HttpHeader} from "../router/decorator/parameter/header.decorator";
import {FindOptions, Op, WhereOptions} from "sequelize";
import {Enemene} from "../../..";
import {AbstractController} from "../router/class/abstract-controller.class";
import {ModelService} from "../model/service/model.service";
import {View} from "./class/view.class";

@Controller("view")
export default class ViewGetController extends AbstractController {

    private viewService: ViewService = Enemene.app.inject(ViewService);

    getView<ENTITY extends DataObject<ENTITY>>(viewName: string, user: AbstractUser): View<ENTITY> {
        Enemene.app.inject(PermissionService).checkViewPermission(viewName, RequestMethod.GET, user);
        return this.viewService.getViewNotNull(viewName);
    }

    @Get("/count/:view", true)
    async countObjects<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                          @Path("view") viewName: string,
                                                          @Query("search") search: string,
                                                          @Context() context: Dictionary<serializable>): Promise<object> {
        const view: View<ENTITY> = this.getView(viewName, user);
        const findOptions: FindOptions = {};
        if (view.searchAttributes && search) {
            findOptions.where = {
                ...(findOptions.where ?? {}),
                [Op.or]: view.searchAttributes.reduce((result: WhereOptions, attribute: string) => {
                    result[attribute] = {
                        [Op.like]: `%${search}%`,
                    };
                    return result;
                }, {})
            };
        }

        return {
            data: {
                count: await DataService.count(view.entity(), this.viewService.getFindOptions(view, ["id"], user, context, findOptions))
            },
        };
    }

    @Get("/:view", true)
    async getObjects<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                        @Path("view") viewName: string,
                                                        @Query("fields") requestedFields: string,
                                                        @Query("order") order: string,
                                                        @Query("limit") limit: string,
                                                        @Query("offset") offset: string,
                                                        @Query("search") search: string,
                                                        @Context() context: Dictionary<serializable>,
                                                        @Header(HttpHeader.LANGUAGE) language: string): Promise<DataResponse<ENTITY>> {
        const view: View<ENTITY> = this.getView(viewName, user);

        const findOptions: FindOptions = DataService.getFindOptions(order, limit, offset);
        if (view.searchAttributes && search) {
            findOptions.where = {
                ...(findOptions.where ?? {}),
                [Op.or]: view.searchAttributes.reduce((result: WhereOptions, attribute: string) => {
                    result[attribute] = {
                        [Op.like]: `%${search}%`,
                    };
                    return result;
                }, {})
            };
        }
        return {
            data: await this.viewService.findAll(view, this.viewService.getRequestedFields(requestedFields ?? "*"), user, context, findOptions),
            model: view.getModel(language),
            actions: view.getActionConfigurations(),
        };
    }

    @Get("/:view/:id", true)
    async getObject<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                       @Path("view") viewName: string,
                                                       @Path("id") objectId: string,
                                                       @Query("fields") requestedFields: string,
                                                       @Context() context: Dictionary<serializable>): Promise<DataResponse<ENTITY>> {
        const view: View<ENTITY> = this.getView(viewName, user);
        return {
            data: await this.viewService.findById(view, objectId, this.viewService.getRequestedFields(requestedFields), user, context),
            model: view.getModel(),
            actions: view.getActionConfigurations(),
        };
    }

    @Get("/:view/:id/:attribute", true)
    async getCollection<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                           @Path("view") viewName: string,
                                                           @Path("id") objectId: string,
                                                           @Path("attribute") collectionField: keyof ENTITY,
                                                           @Query("fields") requestedFields: string,
                                                           @Context() context: Dictionary<serializable>): Promise<DataResponse<any>> {
        const baseView: View<ENTITY> = this.getView(viewName, user);
        if (!baseView.$fields.find(field => field.name === collectionField)) {
            throw new ObjectNotFoundError();
        }

        const fields: string[] = baseView.getFields(this.viewService.getRequestedFields(requestedFields));
        const model = baseView.getModel();

        let subFields: string[] = fields.filter(field => field.startsWith(`${String(collectionField)}.`));
        const data: DataObject<ENTITY> = await DataService.findNotNullById(baseView.entity(), objectId, this.viewService.getFindOptions(baseView, [collectionField as string], user, context));

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
        const baseView: View<ENTITY> = this.getView(viewName, user);

        if (!baseView.$fields.find(field => field.name === collectionField)) {
            throw new UnauthorizedError();
        }

        const fields = this.viewService.getRequestedFields(requestedFields).map((field: string) => `${collectionField}.${field}`);

        const data: DataObject<ENTITY> = await DataService.findNotNullById(baseView.entity(), objectId, this.viewService.getFindOptions(baseView, fields, user, context));
        const model = baseView.getModel();

        const subData: Dictionary<any, keyof ENTITY> = await DataService.filterFields(data, fields);

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
                       @Path("view") viewName: string): Promise<Dictionary<serializable>> {
        const view: View<any> = this.getView(viewName, user);
        return view.getModel();
    }

    @Get("/allowedValues/:view/:attribute", true)
    async getAllowedValuesForObject<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                                       @Path("view") viewName: string,
                                                                       @Path("attribute") collectionField: keyof ENTITY,
                                                                       @Context() context: Dictionary<serializable>): Promise<DataResponse<any>> {
        const baseView: View<ENTITY> = this.getView(viewName, user);

        const collectionViewField: ViewFieldDefinition<ENTITY> | undefined = baseView.$fields
            .find((field: ViewFieldDefinition<ENTITY>) => field.name === collectionField);

        if (!collectionViewField) {
            throw new ObjectNotFoundError();
        }

        const object: ENTITY = new (baseView.entity())();

        return ModelService.getAllowedValues(object, collectionViewField.name as keyof ENTITY, user);
    }
}
