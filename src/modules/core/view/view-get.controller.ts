import {Context, Get, Path, Query, Req} from "../router";
import {AbstractUser, SecureRequest} from "../auth";
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
import {get} from "lodash";
import {UuidService} from "../../..";
import {InputValidationError} from "../validation/error/input-validation.error";


@Controller("view")
export default class ViewGetController extends AbstractViewController {

    private filterFields<VIEW extends View<any>>(object: VIEW | VIEW[], fieldsString?: string): Dictionary<serializable> | Dictionary<serializable>[] {
        if (!fieldsString) {
            if (Array.isArray(object)) {
                return object.map(obj => obj.toJSON());
            } else {
                return object.toJSON();
            }
        }

        const fields: string[] = fieldsString.split(",");
        const values: Dictionary<serializable> | Dictionary<serializable>[] = Array.isArray(object) ? [] : {};

        for (let field of fields) {
            if (field.includes(".")) {
                const fieldTokens = field.split(".");
                const firstToken = fieldTokens.shift();
                if (firstToken.includes("#")) {
                    throw new InputValidationError([]);
                }
            } else {
                let actualField = field;
                if (field.includes("#")) {
                    actualField = field.replace("#", "");
                }
                let value: any = get(object, actualField);
                if (field.includes("#") && Array.isArray(value)) {
                    values[field] = value.length;
                }
                values[field] = value;
            }
        }

        return values;
    }

    @Get("/count/:view", true)
    async countObjects<ENTITY extends DataObject<ENTITY>>(@Path("view") viewName: string,
                                                          @Query("search") search: string,
                                                          @Context() context: RequestContext<AbstractUser>): Promise<object> {
        return {
            data: {
                count: (await this.getObjects(viewName, "id", "", "", "", search, context, "")).data.length,
            },
        };
    }

    @Get("/count/:view/:id/*", true)
    async countObjectsByPath<ENTITY extends DataObject<ENTITY>>(@Path("view") viewName: string,
                                                                @Path("id") objectId: string,
                                                                @Query("search") search: string,
                                                                @Req request: SecureRequest,
                                                                @Context() context: RequestContext<AbstractUser>): Promise<object> {
        const response: DataResponse<ENTITY> = await this.getByPath(viewName, objectId, request, "id", context);
        let count = 0;
        if (!Array.isArray(response.data)) {
            count = 1;
        } else {
            count = response.data.length;
        }
        return {
            data: {
                count,
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
                                                        @Header(HttpHeader.LANGUAGE) language: string): Promise<DataResponse<ENTITY[]>> {
        const viewDefinition: ViewDefinition<ENTITY> = this.getViewDefinition(viewName, RequestMethod.GET, context);
        const data: View<ENTITY>[] = await this.viewService.findAll(viewDefinition, context, DataService.getFindOptions(order, limit, offset), search);
        return {
            data: data.map((object: View<ENTITY>) => this.filterFields(object, requestedFields)),
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
            data: this.filterFields(await this.viewService.findById(viewDefinition, objectId, context), requestedFields) as Dictionary<any, keyof ENTITY>,
            model: viewDefinition.getModel(),
            actions: viewDefinition.getActionConfigurations(),
        };
    }

    @Get("/:view/:id/*", true)
    async getByPath<ENTITY extends DataObject<ENTITY>>(@Path("view") viewName: string,
                                                       @Path("id") objectId: string,
                                                       @Req request: SecureRequest,
                                                       @Query("fields") requestedFields: string,
                                                       @Context() context: Dictionary<serializable>): Promise<DataResponse<any>> {
        const attributePath = request.params[0];
        if (!attributePath || !attributePath.length) {
            return this.getObject(viewName, objectId, requestedFields, context);
        }

        const viewDefinition: ViewDefinition<ENTITY> = this.getViewDefinition(viewName, RequestMethod.GET, context);

        const view: View<ENTITY> = await this.viewService.findById(viewDefinition, objectId, context);

        const attributeTokens: string[] = attributePath.split("/");

        let data = view;

        for (const token of attributeTokens) {
            if (Array.isArray(data)) {
                if (UuidService.isUuid(token)) {
                    data = data.find((obj: any) => obj.id === token);
                } else if (!isNaN(Number.parseInt(token))) {
                    data = data[Number.parseInt(token)];
                } else {
                    throw new InputValidationError([{
                        type: "field",
                        field: "attributePath",
                        message: `Invalid attribute path: ${attributePath}`,
                    }]);
                }
            } else {
                data = get(data, token);
            }
        }

        return {
            data,
            model: viewDefinition.getModel(undefined, attributePath),
        };
    }

    @Get("/model/:view", true)
    async getViewModel(@Context() context: RequestContext<AbstractUser>,
                       @Path("view") viewName: string): Promise<Dictionary<serializable>> {
        const viewDefinition: ViewDefinition<any> = this.getViewDefinition(viewName, RequestMethod.GET, context);
        return viewDefinition.getModel();
    }

    @Get("/model/:view/*", true)
    async getViewModelByPath(@Context() context: RequestContext<AbstractUser>,
                             @Req request: SecureRequest,
                             @Path("view") viewName: string): Promise<Dictionary<serializable>> {
        const viewDefinition: ViewDefinition<any> = this.getViewDefinition(viewName, RequestMethod.GET, context);
        return viewDefinition.getModel(undefined, request.params[0]);
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
