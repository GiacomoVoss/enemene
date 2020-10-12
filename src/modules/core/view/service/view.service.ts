import {ViewFieldDefinition} from "..";
import {ObjectNotFoundError} from "../../error/object-not-found.error";
import {FindOptions, IncludeOptions} from "sequelize";
import {FilterService} from "../../filter/service/filter.service";
import {EntityField} from "../../model/interface/entity-field.class";
import {ModelService} from "../../model/service/model.service";
import {pick} from "lodash";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {AbstractUser} from "../../auth";
import chalk from "chalk";
import {DataObject, DataService, Enemene} from "../../../..";
import {serializable} from "../../../../base/type/serializable.type";
import {AuthService} from "../../auth/service/auth.service";
import {ReferenceField} from "../../model/interface/reference-field.class";
import {CalculatedField} from "../../model/interface/calculated-field.class";
import {RuntimeError} from "../../application/error/runtime.error";
import {ConstructorOf} from "../../../../base/constructor-of";
import {View} from "../class/view.class";

/**
 * Service for handling views for data manipulation.
 */
export class ViewService {

    private VIEWS: Dictionary<ConstructorOf<View<any>>> = {};

    /**
     * Initializes the ViewService by importing all available views and making them available.
     *
     * @param views
     */
    public async init(views: Dictionary<ConstructorOf<View<any>>>) {
        const length: number = Object.entries(views).map(([viewName, view]) => {
            this.addViewClass(viewName, view);
            Enemene.log.debug(this.constructor.name, `Registering ${chalk.bold(viewName)}`);
            return view;
        }).length;
        Enemene.log.info(this.constructor.name, `Registered ${chalk.bold(length)} views.`);
    }

    /**
     * Add a {@link View} to the view list.
     *
     * @param name Name of the view.
     * @param viewClass The view.
     */
    public addViewClass(name: string, viewClass: ConstructorOf<View<any>>): void {
        console.log(viewClass.prototype.id);
        if (this.VIEWS[name]) {
            throw new Error(`Duplicate view ${chalk.bold(name)}`);
        }
        this.VIEWS[name] = viewClass;
    }

    public async findAll<ENTITY extends DataObject<ENTITY>>(view: View<any>, requestedFields: string[], user: AbstractUser, context: Dictionary<serializable> = {}, additionalFindOptions: FindOptions = {}): Promise<Dictionary<any, keyof ENTITY>[]> {
        const data: DataObject<ENTITY>[] = await DataService.findAll(view.entity(), this.getFindOptions(view, requestedFields, user, context, additionalFindOptions));
        return Promise.all(data.map((object: DataObject<ENTITY>) => this.filterFields(object, view, requestedFields)));
    }

    public async filterFields<ENTITY extends DataObject<ENTITY>>(object: ENTITY, view: View<any>, requestedFields: string[]): Promise<Dictionary<any, keyof ENTITY>> {
        return DataService.filterFields(object, view.getFields(requestedFields));
    }

    public async findById<ENTITY extends DataObject<ENTITY>>(view: View<any>, id: string, requestedFields: string[], user: AbstractUser, context: Dictionary<serializable> = {}): Promise<Dictionary<any, keyof ENTITY>> {
        const data: DataObject<ENTITY> = await DataService.findNotNullById(view.entity(), id, this.getFindOptions(view, requestedFields, user, context));
        return this.filterFields(data, view, requestedFields);
    }

    public getRequestedFields(requestedFieldsString?: string): string[] {
        if (!requestedFieldsString) {
            return ["*"];
        } else {
            return requestedFieldsString.split(",");
        }
    }

    /**
     * Gets a {@link View} from the view list.
     * Throws an {@link ObjectNotFoundError} if it wasn't found.
     *
     * @param viewName Name of the view.
     */
    public getViewNotNull(viewName: string): View<any> {
        if (!this.VIEWS[viewName]) {
            throw new ObjectNotFoundError(viewName);
        }
        return new this.VIEWS[viewName]();
    }

    public getFindOptions(view: View<any>, requestedFields: string[], user?: AbstractUser, additionalContext: object = {}, additionalFindOptions: FindOptions = {}): FindOptions {
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
        this.addIncludeAndAttributes(view.entity().name, view.$fields, find);

        return find;
    }


    public addIncludeAndAttributes(entity: string, fields: ViewFieldDefinition<any>[], findOptions: FindOptions = {}): void {
        const model = ModelService.getFields(entity);
        if (!findOptions.attributes) {
            findOptions.attributes = ["id"];
        }
        if (!findOptions.include) {
            findOptions.include = [];
        }
        for (const field of fields) {
            let fieldName: string = field.name;
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
                    this.addIncludeAndAttributes(entity, entityField.includeFields.map(f => new ViewFieldDefinition<any>(f, 0)), findOptions);
                }
            } else {
                const include: IncludeOptions = {model: (entityField as ReferenceField).classGetter(), as: fieldName, required: false};
                if (field.subView) {
                    const subView: View<any> = new field.subView();
                    this.addIncludeAndAttributes(
                        subView.entity().name,
                        subView.$fields,
                        include,
                    );
                } else {
                    include.attributes = ModelService.getDisplayPatternFields((entityField as ReferenceField).classGetter().name).map((ef: EntityField) => ef.name);
                }
                findOptions.include.push(include);
            }
        }
    }
}
