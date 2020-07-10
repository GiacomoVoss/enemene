import {View, ViewFieldDefinition} from "..";
import {ObjectNotFoundError} from "../../error/object-not-found.error";
import {FindOptions} from "sequelize";
import {FilterService} from "../../filter/service/filter.service";
import {EntityField} from "../../model/interface/entity-field.class";
import {ModelService} from "../../model/service/model.service";
import {merge, omit} from "lodash";
import {CollectionField} from "../../model/interface/collection-field.class";
import {ManyToManyField} from "../../model/interface/many-to-many-field.class";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {AbstractUser} from "../../auth";
import {LogService} from "../../log/service/log.service";

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
            LogService.log.debug("[ViewService] Imported " + viewName);
            return view;
        }).length;
        LogService.log.info(`[ViewService] Imported ${length} Views.`);
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

    /**
     * Gets a {@link View} from the view list.
     *
     * @param viewName Name of the view.
     */
    public static getView(viewName: string): View<any> {
        if (!ViewService.VIEWS[viewName]) {
            return null;
        }

        return ViewService.VIEWS[viewName];
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

    public static getFields(view: View<any>): string[] {
        const fields: string[] = [];
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

        return fields;
    }

    public static getFindOptions(view: View<any>, user: AbstractUser, additionalContext: object = {}): FindOptions {
        const context: any = {
            currentUserId: user.id,
            currentUserRoleId: user.roleId,
            ...additionalContext,
        };
        let find: FindOptions = {};
        if (view.filter) {
            find = FilterService.toSequelize(view.filter, context);
        }

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
