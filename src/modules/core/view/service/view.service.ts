import {View, ViewFieldDefinition} from "..";
import {ObjectNotFoundError} from "../../error/object-not-found.error";
import {FindOptions} from "sequelize";
import {FilterService} from "../../filter/service/filter.service";
import {EntityField} from "../../model/interface/entity-field.class";
import {ModelService} from "../../model/service/model.service";
import {intersection, merge, omit} from "lodash";
import {CollectionField} from "../../model/interface/collection-field.class";
import {ManyToManyField} from "../../model/interface/many-to-many-field.class";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {AbstractUser} from "../../auth";
import chalk from "chalk";
import {DataObject, DataResponse, DataService, Enemene} from "../../../..";
import {ActionConfiguration} from "../../action/interface/action-configuration.interface";
import {serializable} from "../../../../base/type/serializable.type";

/**
 * Service for handling views for data manipulation.
 */
export class ViewService {

    private static VIEWS: Dictionary<View<any>> = {};

    /**
     * Initializes the ViewService by importing all available views and making them available.
     *
     * @param views
     */
    public static async init(views: Dictionary<View<any>>) {
        const length: number = Object.entries(views).map(([viewName, view]) => {
            ViewService.addView(viewName, view);
            Enemene.log.debug(this.name, `Registering ${chalk.bold(viewName)}`);
            return view;
        }).length;
        Enemene.log.info(this.name, `Registered ${chalk.bold(length)} views.`);
    }

    /**
     * Add a {@link View} to the view list.
     *
     * @param name Name of the view.
     * @param view The view.
     */
    public static addView(name: string, view: View<any>): void {
        if (!ViewService.VIEWS[name]) {
            ViewService.VIEWS[name] = view;
        }
    }

    public static async findAllByView<ENTITY extends DataObject<ENTITY>>(view: View<any>, requestedFields: string, user: AbstractUser, context: Dictionary<serializable> = {}, find?: FindOptions): Promise<DataResponse<ENTITY>> {
        let fields: string[] = ViewService.getFields(view, requestedFields);

        const data: DataObject<ENTITY>[] = await DataService.findAll(view.entity(), ViewService.getFindOptions(view, user, context, find));
        const model = ViewService.getModelForView(view);
        return {
            data: await Promise.all(data.map((object: DataObject<ENTITY>) => DataService.filterFields(object, fields))) as Partial<ENTITY>[],
            model,
            actions: ViewService.getViewActions(view),
        };
    }

    public static async findByIdByView<ENTITY extends DataObject<ENTITY>>(view: View<any>, id: string, requestedFields: string, user: AbstractUser, context: Dictionary<serializable> = {}): Promise<DataResponse<ENTITY>> {
        let fields: string[] = ViewService.getFields(view, requestedFields);

        const data: DataObject<ENTITY> = await DataService.findNotNullById(view.entity(), id, ViewService.getFindOptions(view, user, context));
        const model = ViewService.getModelForView(view);
        return {
            data: await DataService.filterFields(data, fields) as Partial<ENTITY>,
            model,
            actions: ViewService.getViewActions(view),
        };
    }

    /**
     * Gets a {@link View} from the view list.
     *
     * @param viewName Name of the view.
     */
    public static getView(viewName: string): View<any> {
        if (!ViewService.VIEWS[viewName]) {
            return null;
        }

        return {
            actions: [],
            ...ViewService.VIEWS[viewName],
        };
    }

    public static getViewActions(view: View<any>): ActionConfiguration[] {
        return (view.actions ?? []).map(actionClass => actionClass.getConfiguration());
    }

    /**
     * Gets a {@link View} from the view list.
     * Throws an {@link ObjectNotFoundError} if it wasn't found.
     *
     * @param viewName Name of the view.
     */
    public static getViewNotNull(viewName: string): View<any> {
        const view: View<any> = ViewService.getView(viewName);
        if (view === null) {
            throw new ObjectNotFoundError(viewName);
        }
        return view;
    }

    public static getFields(view: View<any>, requestedFieldsString?: string): string[] {
        let fields: string[] = [];
        let fieldName: string;
        for (const viewField of view.fields) {
            if (typeof viewField === "string") {
                fieldName = viewField;
                fields.push(viewField);
            } else {
                const viewFieldDefinition: ViewFieldDefinition<any, any> = viewField as ViewFieldDefinition<any, any>;
                fieldName = viewFieldDefinition.field as string;
                fields.push(viewFieldDefinition.field as string);
                fields.push(...this.getFields(viewFieldDefinition.view).map(field => `${String(viewFieldDefinition.field)}.${field}`));
            }
            const entityField: EntityField = ModelService.getFields(view.entity().name)[fieldName];
            if (entityField instanceof CollectionField || entityField instanceof ManyToManyField) {
                fields.push(`${fieldName}.$count`);
            }
        }

        if (requestedFieldsString && requestedFieldsString !== "*") {
            fields = intersection(fields, requestedFieldsString.split(","));
        }

        return fields;
    }

    public static getFindOptions(view: View<any>, user?: AbstractUser, additionalContext: object = {}, additionalFindOptions: FindOptions = {}): FindOptions {
        const context: any = {
            ...additionalContext,
        };
        if (user) {
            context.currentUserId = user.id;
            context.currentUserRoleId = user.roleId;
        }

        let find: FindOptions = {};
        if (view.filter) {
            find = FilterService.toSequelize(view.filter, context);
        }

        find.order = additionalFindOptions.order ?? view.defaultOrder;
        find.limit = additionalFindOptions.limit;

        return find;
    }

    public static getModelForView(view: View<any>): Dictionary<Dictionary<EntityField> | string> {
        const model = ModelService.getModel(view.entity().name, ViewService.getFields(view));
        view.fields.forEach(field => {
            if (typeof field !== "string") {
                const viewFieldDefinition: ViewFieldDefinition<any, any> = field as ViewFieldDefinition<any, any>;
                merge(model, omit(ModelService.getModel(viewFieldDefinition.view.entity().name, ViewService.getFields(viewFieldDefinition.view)), "$root"));
                if (viewFieldDefinition.allowedValuesView) {
                    model[view.entity().name][viewFieldDefinition.field] = {
                        ...model[view.entity().name][viewFieldDefinition.field],
                    };
                }
            }
        });

        return model;
    }
}
