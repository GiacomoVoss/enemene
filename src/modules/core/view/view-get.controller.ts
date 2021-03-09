import {Context, Get, Path, Query, Req} from "../router";
import {AbstractUser, SecureRequest} from "../auth";
import {DataResponse, DataService} from "../data";
import {DataObject} from "../model";
import {ViewFieldDefinition, ViewInitializerService} from "./";
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
import {get, set} from "lodash";
import {InvalidAttributePathError} from "./error/invalid-attribute-path.error";
import {AbstractFilter} from "../filter";
import {Enemene} from "../application";


@Controller("view")
export default class ViewGetController extends AbstractViewController {

    private dataService: DataService = Enemene.app.inject(DataService);

    private dotize(jsonobj: any, prefix?: string) {
        var newobj = {};

        function recurse(o, p) {
            for (const f in o) {
                const pre = (p === undefined ? "" : p + ".");
                if (o[f] && typeof o[f] === "object") {
                    newobj = recurse(o[f], pre + f);
                } else {
                    newobj[pre + f] = o[f];
                }
            }
            return newobj;
        }

        return recurse(jsonobj, prefix);
    }

    private filterFields<VIEW extends View<any>>(object: VIEW, fieldsString?: string): Dictionary<serializable> | undefined {
        if (!object) {
            return undefined;
        }
        const data: any = object.toJSON();
        if (!fieldsString) {
            return data;
        }

        const fields: string[] = fieldsString.split(",");
        const fieldsMap: any = fields.reduce((map: any, field: string) => {
            set(map, field.trim(), true);
            return map;
        }, {});

        const values: Dictionary<serializable> = {};

        for (let [field, subFields] of Object.entries(fieldsMap)) {
            let value: any = get(object, field);
            if (Object.keys(subFields).includes("$count")) {
                if (Array.isArray(value) || value === undefined) {
                    values[field + ".$count"] = (value ?? []).length;
                } else {
                    throw new InvalidAttributePathError(field);
                }
            } else if (typeof subFields === "boolean") {
                values[field] = value;
            } else if (Array.isArray(value)) {
                if (!value.length) {
                    values[field] = [];
                } else if (typeof value[0] === "object") {
                    const subFieldsString: string = Object.keys(this.dotize(subFields)).join(",");
                    values[field] = value.map(v => this.filterFields(v, subFieldsString));
                }
            } else if (typeof value === "object") {
                const subFieldsString: string = Object.keys(this.dotize(subFields)).join(",");
                values[field] = this.filterFields(value, subFieldsString);
            }
        }

        values.id = data.id;
        values.$entity = data.$entity;
        values.$displayPattern = data.$displayPattern;

        return values;
    }

    @Get("/count/:view", true)
    async countObjects<ENTITY extends DataObject<ENTITY>>(@Path("view") viewName: string,
                                                          @Query("search") search: string,
                                                          @Context context: RequestContext<AbstractUser>): Promise<object> {
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
                                                                @Context context: RequestContext<AbstractUser>): Promise<object> {
        const response: DataResponse<Dictionary<serializable>> = await this.getByPath(viewName, objectId, request, "id", context);
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
                                                        @Query("search") searchString: string,
                                                        @Context context: RequestContext<AbstractUser>,
                                                        @Header(HttpHeader.LANGUAGE) language: string): Promise<DataResponse<Dictionary<serializable>[]>> {
        const viewDefinition: ViewDefinition<ENTITY> = this.getViewDefinition(viewName);
        const data: View<ENTITY>[] = await this.viewService.findAll(viewDefinition.viewClass, context, undefined, this.viewHelperService.parseFindOptions(order, limit, offset, searchString));
        return {
            data: data.map((object: View<ENTITY>) => this.filterFields(object, requestedFields)),
            model: viewDefinition.getModel(context),
            actions: viewDefinition.getActionConfigurations(),
        };
    }

    @Get("/:view/:id", true)
    async getObject<ENTITY extends DataObject<ENTITY>>(@Path("view") viewName: string,
                                                       @Path("id") objectId: string,
                                                       @Query("fields") requestedFields: string,
                                                       @Context context: RequestContext<AbstractUser>): Promise<DataResponse<Dictionary<serializable>>> {
        const viewDefinition: ViewDefinition<ENTITY> = this.getViewDefinition(viewName);
        return {
            data: this.filterFields(await this.viewService.findById(viewDefinition.viewClass, objectId, context), requestedFields),
            model: viewDefinition.getModel(context),
            actions: viewDefinition.getActionConfigurations(),
        };
    }

    @Get("/:view/:id/*", true)
    async getByPath<ENTITY extends DataObject<ENTITY>>(@Path("view") viewName: string,
                                                       @Path("id") objectId: string,
                                                       @Req request: SecureRequest,
                                                       @Query("fields") requestedFields: string,
                                                       @Context context: RequestContext<AbstractUser>): Promise<DataResponse<Dictionary<serializable>>> {
        const attributePath = request.params[0];
        if (!attributePath || !attributePath.length) {
            return this.getObject(viewName, objectId, requestedFields, context);
        }

        const viewDefinition: ViewDefinition<ENTITY> = this.getViewDefinition(viewName);

        const view: View<ENTITY> = await this.viewService.findById(viewDefinition.viewClass, objectId, context);

        return {
            data: view.getByPath(attributePath),
            model: viewDefinition.getModel(context, attributePath),
        };
    }

    @Get("/model/:view", true)
    async getViewModel(@Context context: RequestContext<AbstractUser>,
                       @Path("view") viewName: string): Promise<Dictionary<serializable>> {
        const viewDefinition: ViewDefinition<any> = this.getViewDefinition(viewName);
        return viewDefinition.getModel(context);
    }

    @Get("/model/:view/*", true)
    async getViewModelByPath(@Context context: RequestContext<AbstractUser>,
                             @Req request: SecureRequest,
                             @Path("view") viewName: string): Promise<Dictionary<serializable>> {
        const viewDefinition: ViewDefinition<any> = this.getViewDefinition(viewName);
        return viewDefinition.getModel(context, request.params[0]);
    }

    @Get("/allowedValues/:view/:attribute", true)
    async getAllowedValues<ENTITY extends DataObject<ENTITY>, SUBENTITY extends DataObject<SUBENTITY>>(@Path("view") viewName: string,
                                                                                                       @Path("attribute") attribute: keyof ENTITY,
                                                                                                       @Context context: RequestContext<AbstractUser>): Promise<DataResponse<View<SUBENTITY>[]>> {

        const viewDefinition: ViewDefinition<ENTITY> = this.getViewDefinition(viewName);

        const viewField: ViewFieldDefinition<ENTITY, SUBENTITY> | undefined = viewDefinition.fields
            .find((field: ViewFieldDefinition<ENTITY, SUBENTITY>) => field.name === attribute);

        if (!viewField) {
            throw new ObjectNotFoundError();
        }

        const entityField: ReferenceField = ModelService.getFields(viewDefinition.entity.name)[attribute as string];

        if (!(entityField instanceof ReferenceField)) {
            throw new UnsupportedOperationError("Cannot get allowed values.");
        }

        const allowedValuesFilter: AbstractFilter = ModelService.getAllowedValuesFilter(viewDefinition.entity, viewField.name as keyof ENTITY, context);
        const subViewDefinition: ViewDefinition<SUBENTITY> = ViewInitializerService.getSelectionViewDefinition(entityField.classGetter());
        // const data: View<SUBENTITY>[] = await this.viewService.findAll(subViewDefinition.viewClass, new UnrestrictedRequestContext(), allowedValuesFilter);
        const data: DataObject<ENTITY>[] = await this.dataService.findAll(subViewDefinition.entity, allowedValuesFilter);
        return {
            data: data.map(d => this.viewHelperService.wrap(d, subViewDefinition)) as View<SUBENTITY>[],
            model: viewDefinition.getModel(context),
        };
    }
}
