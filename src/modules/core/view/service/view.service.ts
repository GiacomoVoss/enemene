import {ViewFieldDefinition} from "..";
import {ObjectNotFoundError} from "../../error/object-not-found.error";
import {FindOptions, IncludeOptions, Op, Transaction, WhereOptions} from "sequelize";
import {FilterService} from "../../filter/service/filter.service";
import {EntityField} from "../../model/interface/entity-field.class";
import {ModelService} from "../../model/service/model.service";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {AbstractUser} from "../../auth";
import chalk from "chalk";
import {AbstractFilter, DataObject, DataService, Enemene} from "../../../..";
import {serializable} from "../../../../base/type/serializable.type";
import {ReferenceField} from "../../model/interface/reference-field.class";
import {CalculatedField} from "../../model/interface/calculated-field.class";
import {ConstructorOf} from "../../../../base/constructor-of";
import {View} from "../class/view.class";
import {UnsupportedOperationError} from "../../error/unsupported-operation.error";
import {RequestContext} from "../../router/interface/request-context.interface";
import {FileService} from "../../file/service/file.service";
import {ViewDefinition} from "../class/view-definition.class";

/**
 * Service for handling views for data manipulation.
 */
export class ViewService {

    private fileService: FileService = Enemene.app.inject(FileService);
    private VIEWS: Dictionary<ConstructorOf<View<any>>> = {};

    /**
     * Initializes the ViewService by importing all available views and making them available.
     */
    public async init() {
        const viewFiles: string[] = this.fileService.scanForFilePattern(Enemene.app.config.modulesPath, /.*\.view\.js/);
        const viewModules: Dictionary<ConstructorOf<View<any>>>[] = await Promise.all(viewFiles.map((filePath: string) => import(filePath)));
        let count: number = 0;
        viewModules
            .forEach((moduleMap: Dictionary<ConstructorOf<View<any>>>) => {
                Object.values(moduleMap).forEach((module: ConstructorOf<View<any>>) => this.addViewClass(module));
                count += Object.values(moduleMap).length;
            });
        Enemene.log.info(this.constructor.name, `Registered ${chalk.bold(count)} views.`);
    }

    public getAllViews(): string[] {
        return Object.keys(this.VIEWS);
    }

    /**
     * Add a {@link View} to the view list.
     *
     * @param viewClass The view.
     */
    public addViewClass(viewClass: ConstructorOf<View<any>>): void {
        if (this.VIEWS[viewClass.name]) {
            throw new Error(`Duplicate view ${chalk.bold(viewClass.name)}`);
        }
        this.validate(viewClass);
        Enemene.log.debug(this.constructor.name, `Registering view ${chalk.bold(viewClass.name)}.`);
        this.VIEWS[viewClass.name] = viewClass;
    }

    public async count<ENTITY extends DataObject<ENTITY>>(viewDefinition: ViewDefinition<ENTITY>,
                                                          context: Dictionary<serializable> = {},
                                                          additionalFindOptions: FindOptions = {},
                                                          searchString?: string): Promise<number> {
        return (await this.findAll(viewDefinition, context, additionalFindOptions, searchString)).length;
    }

    public async findAll<ENTITY extends DataObject<ENTITY>>(viewDefinition: ViewDefinition<ENTITY>,
                                                            context: Dictionary<serializable> = {},
                                                            additionalFindOptions: FindOptions = {},
                                                            searchString?: string): Promise<View<ENTITY>[]> {
        const data: DataObject<ENTITY>[] = await DataService.findAllRaw(viewDefinition.entity, this.getFindOptions(viewDefinition, context, additionalFindOptions, searchString));
        return data.map((object: DataObject<ENTITY>) => this.wrap(object, viewDefinition)) as View<ENTITY>[];
    }

    public async findAllByView<ENTITY extends DataObject<ENTITY>, VIEW extends View<ENTITY>>(viewClass: ConstructorOf<VIEW>,
                                                                                             filter?: AbstractFilter): Promise<VIEW[]> {
        const viewDefinition: ViewDefinition<ENTITY> = viewClass.prototype.$view;
        const data: DataObject<ENTITY>[] = await DataService.findAllRaw(viewDefinition.entity, {
            ...FilterService.toSequelize(filter, viewDefinition.entity),
        });
        return data.map((object: DataObject<ENTITY>) => this.wrap(object, viewDefinition)) as VIEW[];
    }

    public async findById<ENTITY extends DataObject<ENTITY>>(viewDefinition: ViewDefinition<ENTITY>,
                                                             id: string,
                                                             context: RequestContext<AbstractUser> = {}): Promise<View<ENTITY>> {
        const data: DataObject<ENTITY> = await DataService.findNotNullById(viewDefinition.entity, id, this.getFindOptions(viewDefinition, context));
        return this.wrap(data, viewDefinition) as View<ENTITY>;
    }

    public async save<ENTITY extends DataObject<ENTITY>>(view: View<ENTITY>,
                                                         context: RequestContext<AbstractUser> = {}): Promise<View<ENTITY>> {
        const t: Transaction = await Enemene.app.db.transaction();
        try {
            const viewDefinition: ViewDefinition<ENTITY> = view.$view;
            const where: FindOptions = viewDefinition.filter ? FilterService.toSequelize(viewDefinition.filter(context), viewDefinition.entity) : {};
            const object: DataObject<ENTITY> | null = await DataService.findById(viewDefinition.entity, view.id, where, t);
            let updatedObject: DataObject<ENTITY>;
            if (object) {
                updatedObject = await DataService.update(viewDefinition.entity, object, view.toJSON(), context, t);
            } else {
                updatedObject = await DataService.create(viewDefinition.entity, view.toJSON(), context, where, t);
            }
            await t.commit();
            return this.findById(viewDefinition, updatedObject.id, context);
        } catch (e) {
            await t.rollback();
            throw e;
        }
    }

    public getViewDefinition(viewName: string): ViewDefinition<any> {
        if (!this.VIEWS[viewName]) {
            throw new ObjectNotFoundError(viewName);
        }
        const viewClass = this.VIEWS[viewName];

        return viewClass.prototype.$view;
    }

    public wrap<ENTITY extends DataObject<ENTITY>>(object: ENTITY, viewDefinition: ViewDefinition<ENTITY>, entity?: string): View<ENTITY> {
        const view: View<ENTITY> = new viewDefinition.viewClass();
        const entityFields: Dictionary<EntityField> = ModelService.MODEL[entity ?? object.$entity];
        const viewFields: ViewFieldDefinition<ENTITY, any>[] = viewDefinition.fields;
        for (const viewField of viewFields) {
            const fieldName: string = viewField.name as string;
            let entityField: EntityField | undefined = entityFields[fieldName];

            if (entityField) {

                const key: keyof ENTITY = fieldName as keyof ENTITY;
                let value: any = object[key];
                if (entityField.isSimpleField) {
                    view[fieldName] = (object.toJSON ? object.toJSON()?.[key] : object[key]) ?? null;
                } else {
                    if (viewField.isCount) {
                        view[fieldName] = (value ?? []).length;
                    } else if (viewField.isArray) {
                        value = value as any[];
                        view[fieldName] = (value ?? []).map((subValue: any) => {
                            if (viewField.subView) {
                                const subViewDefinition: ViewDefinition<any> = viewField.subView.prototype.$view;
                                return this.wrap(subValue as unknown as DataObject<ENTITY>, subViewDefinition, subViewDefinition.entity.name) as any;
                            } else {
                                return typeof subValue === "string" ? subValue : this.wrap(subValue, this.getSelectionViewDefinition((entityField as ReferenceField).classGetter()), (entityField as ReferenceField).classGetter().name);
                            }
                        });
                    } else if (value !== null && value !== undefined) {
                        if (viewField.subView) {
                            const subViewDefinition: ViewDefinition<any> = viewField.subView.prototype.$view;
                            view[fieldName] = this.wrap(value as unknown as DataObject<ENTITY>, subViewDefinition, subViewDefinition.entity.name) as any;
                        } else {
                            view[fieldName] = typeof value === "string" ? value : this.wrap(value, this.getSelectionViewDefinition((entityField as ReferenceField).classGetter()), (entityField as ReferenceField).classGetter().name);
                        }
                    } else {
                        view[fieldName] = null;
                    }
                }
            }
        }

        view.id = object.id;
        view.$displayPattern = object.$displayPattern;

        return view;
    }

    public getFindOptions(viewDefinition: ViewDefinition<any>,
                          context: RequestContext<AbstractUser> = {},
                          additionalFindOptions: FindOptions = {},
                          searchString?: string): FindOptions {
        let find: FindOptions = {...additionalFindOptions};
        if (viewDefinition.filter) {
            const filterOptions: FindOptions = FilterService.toSequelize(viewDefinition.filter(context), viewDefinition.entity);
            find.include = [
                ...(find.include ?? []),
                ...(filterOptions.include ?? []),
            ];
            find.where = {
                [Op.and]: {
                    ...(find.where ?? {}),
                    ...(filterOptions.where ?? {}),
                }
            };
        }

        find.order = find.order ?? viewDefinition.defaultOrder;

        if (viewDefinition.searchAttributes && searchString) {
            find.where = {
                ...find.where,
                [Op.or]: viewDefinition.searchAttributes.reduce((result: WhereOptions, attribute: string) => {
                    result[attribute] = {
                        [Op.like]: `%${searchString}%`,
                    };
                    return result;
                }, {})
            };
        }

        this.addIncludeAndAttributes(viewDefinition.entity.name, viewDefinition.fields, find);

        return find;
    }


    public addIncludeAndAttributes(entity: string, fields: ViewFieldDefinition<any, any>[], findOptions: FindOptions = {}): void {
        const model = ModelService.getFields(entity);
        if (!findOptions.attributes) {
            findOptions.attributes = ["id"];
        }
        if (!findOptions.include) {
            findOptions.include = [];
        }
        for (const field of fields) {
            let fieldName: string = field.name as string;

            let entityField: EntityField = model[fieldName];
            if (!entityField) {
                fieldName = fieldName.substr(0, fieldName.indexOf(".$count"));
                entityField = model[fieldName];
            }
            if (!entityField) {
                throw new UnsupportedOperationError(`Unknown field ${chalk.bold(fieldName)} in entity ${chalk.bold(entity)}.`);
            }
            if (entityField.isSimpleField || entityField instanceof CalculatedField) {
                (findOptions.attributes as string[]).push(fieldName);
                if (entityField instanceof CalculatedField) {
                    const includes: ViewFieldDefinition<any, any>[] = entityField.includeFields
                        .filter((f: string) => !f.includes("."))
                        .map(f => new ViewFieldDefinition<any, any>(f as any, 0));
                    this.addIncludeAndAttributes(entity, includes, findOptions);
                }
            } else {
                const include: IncludeOptions = {model: (entityField as ReferenceField).classGetter(), as: fieldName, required: false};
                if (field.subView) {
                    const viewDefinition: ViewDefinition<any> = field.subView.prototype.$view;
                    this.addIncludeAndAttributes(
                        viewDefinition.entity.name,
                        viewDefinition.fields,
                        include,
                    );
                } else if (field.isCount) {
                    include.attributes = ["id"];
                } else {
                    include.attributes = ModelService.getDisplayPatternFields((entityField as ReferenceField).classGetter().name).map((ef: EntityField) => ef.name);
                }
                findOptions.include.push(include);
            }
        }
    }

    private validate(viewClass: ConstructorOf<View<any>>): void {
        const viewDefinition: ViewDefinition<any> = viewClass.prototype.$view;
        const entityFields: Dictionary<EntityField> = ModelService.getFields(viewDefinition.entity.name);
        for (const viewField of viewDefinition.fields) {
            const name: string = viewField.name;
            if (!entityFields[name]) {
                throw new Error(`Error validating ${chalk.underline(viewClass.name)}: Field ${chalk.bold(name)} does not exist in entity ${chalk.bold(viewDefinition.entity.name)}.`);
            }
            if (!entityFields[name].isSimpleField && !viewField.subView) {
                // viewField.subView = this.getSelectionViewDefinition((entityFields[name] as ReferenceField).classGetter());
            }
        }
    }

    public getSelectionViewDefinition<ENTITY extends DataObject<ENTITY>>(entity: ConstructorOf<ENTITY>): ViewDefinition<ENTITY> {
        return new ViewDefinition(
            entity,
            class SelectionView extends View<ENTITY> {
                public $view: any = {
                    entity: entity.name,
                };
            },
            ModelService.getDisplayPatternFields(entity.name)
                .map((entityField: EntityField) => new ViewFieldDefinition(entityField.name as any, 0, {name: "String"}))
        );
    }
}
