import {DataObject} from "../../model";
import {ViewDefinition} from "../class/view-definition.class";
import {View} from "../class/view.class";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {EntityField} from "../../model/interface/entity-field.class";
import {ModelService} from "../../model/service/model.service";
import {ViewFieldDefinition} from "../class/view-field-definition.class";
import {ReferenceField} from "../../model/interface/reference-field.class";
import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUser} from "../../auth";
import {FindOptions, IncludeOptions, Op, WhereOptions} from "sequelize";
import {FilterService} from "../../filter";
import {Includeable, OrderItem} from "sequelize/types/lib/model";
import {UnsupportedOperationError} from "../../error";
import chalk from "chalk";
import {CalculatedField} from "../../model/interface/calculated-field.class";
import {ViewFindOptions} from "../interface/view-find-options.interface";

export class ViewHelperService {

    public wrap<ENTITY extends DataObject<ENTITY>>(object: ENTITY, viewDefinition: ViewDefinition<ENTITY>, entity?: string): View<ENTITY> {
        const view: View<ENTITY> = new viewDefinition.viewClass();
        const entityFields: Dictionary<EntityField> = ModelService.MODEL[entity ?? object.$entity];
        const viewFields: ViewFieldDefinition<ENTITY, any>[] = viewDefinition.fields;
        for (const viewField of viewFields) {
            const fieldName: string = viewField.name as string;
            let entityField: EntityField | undefined = entityFields?.[fieldName];

            if (entityField) {
                const key: keyof ENTITY = fieldName as keyof ENTITY;
                let value: any = object[key];
                if (typeof value === "function") {
                    value = value.apply(object);
                }
                if (entityField.isSimpleField) {
                    view[fieldName] = (object.toJSON ? object.toJSON()?.[key] : object[key]) ?? null;
                } else {
                    if (viewField.isArray) {
                        value = value as any[];
                        view[fieldName] = (value ?? []).map((subValue: any) => {
                            if (viewField.subView) {
                                const subViewDefinition: ViewDefinition<any> = viewField.subView.prototype.$view;
                                return this.wrap(subValue as unknown as DataObject<ENTITY>, subViewDefinition, subViewDefinition.entity.name) as any;
                            } else if ((entityField as ReferenceField).classGetter) {
                                return typeof subValue === "string" ? subValue : subValue.id;
                            } else {
                                return subValue;
                            }
                        });
                    } else if (value !== null && value !== undefined) {
                        if (viewField.subView) {
                            const subViewDefinition: ViewDefinition<any> = viewField.subView.prototype.$view;
                            view[fieldName] = this.wrap(value as unknown as DataObject<ENTITY>, subViewDefinition, subViewDefinition.entity.name) as any;
                        } else if ((entityField as ReferenceField).classGetter) {
                            view[fieldName] = typeof value === "string" ? value : value.id;
                        } else {
                            view[fieldName] = value;
                        }
                    } else {
                        view[fieldName] = null;
                    }
                }
            } else {
                if (!view.$view.entity) {
                    // Special treatment for entityless views.
                    view[fieldName] = (object.toJSON ? object.toJSON()?.[fieldName] : object[fieldName]) ?? null;
                }
            }
        }

        view.id = object.id;
        view.$displayPattern = object.$displayPattern;
        view.isNew = object.isNewRecord;

        return view;
    }

    public parseFindOptions(order?: string, limit?: string, offset?: string, searchString?: string): ViewFindOptions {
        const findOptions: ViewFindOptions = {};

        if (order) {
            let ordersArray: OrderItem[] = order.split(",").map((orderToken: string) => {
                let orderArray: string[] = orderToken.split(":");
                if (orderArray.length === 1) {
                    orderArray.push("ASC");
                } else if (orderArray.length > 2) {
                    orderArray = orderArray.slice(0, 2);
                }
                if (orderArray.length === 2) {
                    return [orderArray[0], orderArray[1]] as OrderItem;
                }

                return undefined;
            })
                .filter(orderArray => !!orderArray);
            if (ordersArray.length) {
                findOptions.order = ordersArray;
            }
        }
        if (limit && !isNaN(parseInt(limit))) {
            findOptions.limit = parseInt(limit);
        }

        if (offset && !isNaN(parseInt(offset))) {
            findOptions.offset = parseInt(offset);
        }

        findOptions.searchString = searchString?.length ? searchString : undefined;

        return findOptions;
    }

    public getFindOptions(viewDefinition: ViewDefinition<any>,
                          context: RequestContext<AbstractUser>,
                          additionalFindOptions: FindOptions = {},
                          searchString?: string): FindOptions {
        let find: FindOptions = {...additionalFindOptions};
        if (viewDefinition.filter) {
            const filterOptions: FindOptions = FilterService.toSequelize(viewDefinition.filter(context), viewDefinition.entity);
            find.include = [
                ...(find.include ?? []) as Includeable[],
                ...(filterOptions.include ?? []) as Includeable[],
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
        find.transaction = context.transaction;
        return find;
    }


    public addIncludeAndAttributes(entity: string, fields: ViewFieldDefinition<any, any>[], findOptions: FindOptions = {}): void {
        const model = ModelService.getFields(entity);
        if (!findOptions.attributes) {
            findOptions.attributes = [];
        }
        if (!(findOptions.attributes as string[]).includes("id")) {
            (findOptions.attributes as string[]).push("id");
        }
        if (!findOptions.include) {
            findOptions.include = [];
        }
        for (const field of fields) {
            if (!field.calculated) {
                let fieldName: string = field.name as string;

                let entityField: EntityField = model[fieldName];
                if (!entityField && fieldName.includes(".$count")) {
                    fieldName = fieldName.substr(0, fieldName.indexOf(".$count"));
                    entityField = model[fieldName];
                }
                if (!entityField) {
                    throw new UnsupportedOperationError(`Unknown field ${chalk.bold(fieldName)} in entity ${chalk.bold(entity)}.`);
                }
                if (entityField.isSimpleField) {
                    (findOptions.attributes as string[]).push(fieldName);
                } else if (entityField instanceof CalculatedField) {
                    const includes: ViewFieldDefinition<any, any>[] = entityField.includeFields
                        .filter((f: string) => !f.includes("."))
                        .map((f: string, position: number) => new ViewFieldDefinition<any, any>(f as any, entityField.type, {
                            position,
                        }));
                    this.addIncludeAndAttributes(entity, includes, findOptions);
                } else {
                    const referenceField: ReferenceField = entityField as ReferenceField;
                    if (ModelService.isVirtualEntity(referenceField.classGetter())) {
                        (findOptions.attributes as string[]).push(referenceField.foreignKey);
                    } else {
                        const include: IncludeOptions = {model: (entityField as ReferenceField).classGetter(), as: fieldName, required: false};
                        if (field.subView) {
                            const viewDefinition: ViewDefinition<any> = field.subView.prototype.$view;
                            this.addIncludeAndAttributes(
                                viewDefinition.entity.name,
                                viewDefinition.fields,
                                include,
                            );
                        } else {
                            include.attributes = ModelService.getDisplayPatternFields((entityField as ReferenceField).classGetter().name).map((ef: EntityField) => ef.name);
                        }
                        (findOptions.include as Includeable[]).push(include);
                    }
                }
            }
        }
    }
}
