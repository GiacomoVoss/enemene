import {View, ViewFieldDefinition} from "..";
import {ObjectNotFoundError} from "../../error/object-not-found.error";
import {FindOptions, IncludeOptions} from "sequelize";
import {FilterService} from "../../filter/service/filter.service";
import {EntityField} from "../../model/interface/entity-field.class";
import {ModelService} from "../../model/service/model.service";
import {isEqual, omit, pick} from "lodash";
import {CollectionField} from "../../model/interface/collection-field.class";
import {ManyToManyField} from "../../model/interface/many-to-many-field.class";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {AbstractUser} from "../../auth";
import chalk from "chalk";
import {DataObject, DataService, Enemene} from "../../../..";
import {ActionConfiguration} from "../../action/interface/action-configuration.interface";
import {serializable} from "../../../../base/type/serializable.type";
import {EntityModel} from "../../model/type/entity-model.type";
import {I18nService} from "../../i18n/service/i18n.service";
import {AuthService} from "../../auth/service/auth.service";
import {ReferenceField} from "../../model/interface/reference-field.class";
import {CalculatedField} from "../../model/interface/calculated-field.class";
import {RuntimeError} from "../../application/error/runtime.error";
import {ViewField} from "../interface/view-field.interface";

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

    public static async findAll<ENTITY extends DataObject<ENTITY>>(view: View<any>, requestedFields: string[], user: AbstractUser, context: Dictionary<serializable> = {}, additionalFindOptions: FindOptions = {}): Promise<Dictionary<any, keyof ENTITY>[]> {

        const data: DataObject<ENTITY>[] = await DataService.findAll(view.entity(), ViewService.getFindOptions(view, requestedFields, user, context, additionalFindOptions));
        return Promise.all(data.map((object: DataObject<ENTITY>) => ViewService.filterFields(object, view, requestedFields)));
    }

    public static async filterFields<ENTITY extends DataObject<ENTITY>>(object: ENTITY, view: View<any>, requestedFields: string[]): Promise<Dictionary<any, keyof ENTITY>> {
        return DataService.filterFields(object, ViewService.getFields(view, requestedFields));
    }

    public static async findById<ENTITY extends DataObject<ENTITY>>(view: View<any>, id: string, requestedFields: string[], user: AbstractUser, context: Dictionary<serializable> = {}): Promise<Dictionary<any, keyof ENTITY>> {
        const data: DataObject<ENTITY> = await DataService.findNotNullById(view.entity(), id, ViewService.getFindOptions(view, requestedFields, user, context));
        return ViewService.filterFields(data, view, requestedFields);
    }

    public static getRequestedFields(requestedFieldsString?: string): string[] {
        if (!requestedFieldsString) {
            return ["*"];
        } else {
            return requestedFieldsString.split(",");
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

    public static getFields(view: View<any>, requestedFields?: string[]): string[] {
        let fields: string[] = [];
        let fieldName: string;

        // Get all possible fields from view.
        for (const viewField of view.fields) {
            if (typeof viewField === "string") {
                fieldName = viewField;
            } else {
                const viewFieldDefinition: ViewFieldDefinition<any, any> = viewField as ViewFieldDefinition<any, any>;
                fieldName = viewFieldDefinition.field as string;
            }
            const entityField: EntityField = ModelService.getFields(view.entity().name)[fieldName];
            if (entityField) {
                fields.push(entityField.name);
                if (typeof viewField === "string") {
                    if (!entityField.isSimpleField) {
                        fields.push(...ModelService.getDisplayPatternFields((entityField as ReferenceField).classGetter().name).map((field => `${String(entityField.name)}.${field.name}`)));
                    }
                } else {
                    const viewFieldDefinition: ViewFieldDefinition<any, any> = viewField as ViewFieldDefinition<any, any>;
                    fields.push(...this.getFields(viewFieldDefinition.view).map(field => `${String(viewFieldDefinition.field)}.${field}`));
                }

                if (entityField instanceof CollectionField || entityField instanceof ManyToManyField) {
                    fields.push(`${fieldName}.$count`);
                }
            }
        }

        if (requestedFields && !isEqual(requestedFields, ["*"])) {
            return fields.filter((field: string) => {
                if (field === "id" || field.endsWith(".id")) {
                    return true;
                }

                if (requestedFields.includes(field)) {
                    return true;
                }
                const baseField: string = field.substr(0, field.indexOf("."));
                if (requestedFields.includes(baseField) || requestedFields.includes(`${baseField}.*`) || requestedFields.find((f: string) => f.startsWith(`${baseField}`))) {
                    return true;
                }

                return false;
            });
        }

        return fields;
    }

    public static getFindOptions(view: View<any>, requestedFields: string[], user?: AbstractUser, additionalContext: object = {}, additionalFindOptions: FindOptions = {}): FindOptions {
        const context: any = {
            ...additionalContext,
        };
        if (user) {
            context.currentUserId = user.id;
            context.currentUserRoleId = user.roleId;
            context.user = pick(user, AuthService.INCLUDE_IN_TOKEN);
        }

        let find: FindOptions = additionalFindOptions;
        if (view.filter) {
            const filterOptions: FindOptions = FilterService.toSequelize(view.filter, context);
            find.include = [
                ...(find.include ?? []),
                ...(filterOptions.include ?? []),
            ];
            find.where = {
                ...(find.where ?? {}),
                ...(filterOptions.where ?? {}),
            };
        }

        find.order = additionalFindOptions.order ?? view.defaultOrder;
        find.limit = additionalFindOptions.limit;
        find.offset = additionalFindOptions.offset;
        find.include = additionalFindOptions.include ?? [];
        ViewService.addIncludeAndAttributes(view.entity().name, view.fields, find);

        return find;
    }


    public static addIncludeAndAttributes(entity: string, fields: ViewField<any>[], findOptions: FindOptions = {}): void {
        const model = ModelService.getFields(entity);
        if (!findOptions.attributes) {
            findOptions.attributes = ["id"];
        }
        if (!findOptions.include) {
            findOptions.include = [];
        }
        for (const field of fields) {
            let fieldName: string;
            if (typeof field === "string") {
                fieldName = field;
            } else {
                fieldName = (field as ViewFieldDefinition<any, any>).field as string;
            }
            if (fieldName.includes("$count")) {
                fieldName = fieldName.replace(".$count", "");
            }

            const entityField: EntityField = model[fieldName];
            if (!entityField) {
                throw new RuntimeError(`Unknown field "${fieldName}".`);
            }
            if (entityField.isSimpleField || entityField instanceof CalculatedField) {
                (findOptions.attributes as string[]).push(fieldName);
                if (entityField instanceof CalculatedField) {
                    ViewService.addIncludeAndAttributes(entity, entityField.includeFields, findOptions);
                }
            } else {
                const include: IncludeOptions = {model: (entityField as ReferenceField).classGetter(), as: fieldName};
                if (typeof field === "string") {
                    include.attributes = ModelService.getDisplayPatternFields((entityField as ReferenceField).classGetter().name).map((ef: EntityField) => ef.name);
                } else {
                    ViewService.addIncludeAndAttributes(
                        (field as ViewFieldDefinition<any, any>).view.entity().name,
                        (field as ViewFieldDefinition<any, any>).view.fields,
                        include,
                    );
                }
                findOptions.include.push(include);
            }
        }
    }


    public static getModelForView(view: View<any>, language?: string): Dictionary<serializable> {
        let model: EntityModel = ModelService.getModel(view.entity().name, ViewService.getFields(view));
        view.fields.forEach(field => {
            if (typeof field !== "string") {
                const viewFieldDefinition: ViewFieldDefinition<any, any> = field as ViewFieldDefinition<any, any>;
                model = {
                    ...model,
                    ...omit(ModelService.getModel(viewFieldDefinition.view.entity().name, ViewService.getFields(viewFieldDefinition.view)), "$root")
                };
            }
        });

        return I18nService.parseEntityModel(model, language);
    }
}
