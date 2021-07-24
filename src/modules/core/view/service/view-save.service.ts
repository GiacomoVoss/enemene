import {DataObject} from "../../model";
import {View} from "../class/view.class";
import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUser, PermissionService} from "../../auth";
import {uuid} from "../../../../base/type/uuid.type";
import {AfterCreateHook, BeforeCreateHook, BeforeUpdateHook, DataService} from "../../data";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {EntityField} from "../../model/interface/entity-field.class";
import {ModelService} from "../../model/service/model.service";
import {CompositionField} from "../../model/interface/composition-field.class";
import {ReferenceField} from "../../model/interface/reference-field.class";
import {CollectionField} from "../../model/interface/collection-field.class";
import {ValidationService} from "../../validation/service/validation.service";
import {Enemene} from "../../application";
import {RequestMethod} from "../../router/enum/request-method.enum";
import {ViewDefinition} from "../class/view-definition.class";
import {UuidService} from "../../service/uuid.service";
import {ViewFieldDefinition} from "../class/view-field-definition.class";
import {serializable} from "../../../../base/type/serializable.type";
import {ViewHelperService} from "./view-helper.service";
import {AfterUpdateHook} from "../../data/interface/after-update-hook.interface";

export class ViewSaveService {

    private validationService: ValidationService = Enemene.app.inject(ValidationService);
    private viewHelperService: ViewHelperService = Enemene.app.inject(ViewHelperService);
    private permissionService: PermissionService = Enemene.app.inject(PermissionService);

    public async save<ENTITY extends DataObject<ENTITY>>(view: View<ENTITY>,
                                                         context: RequestContext<AbstractUser>): Promise<View<ENTITY>> {
        if (view.isNew) {
            this.checkPermission(view.$view, RequestMethod.POST, context);
        } else {
            this.checkPermission(view.$view, RequestMethod.PUT, context);
        }
        return await this.saveInternal(view, context) as View<ENTITY>;
    }

    private async saveInternal<ENTITY extends DataObject<ENTITY>>(view: View<ENTITY>,
                                                                  context: RequestContext<AbstractUser>,
                                                                  parentFieldPermissions?: Dictionary<boolean>): Promise<View<DataObject<ENTITY>>> {
        this.validationService.validateView(view, context);
        let object: DataObject<ENTITY>;
        let oldObject: any = undefined;
        if (view.isNew) {
            object = new view.$view.entity({
                id: view.id ?? UuidService.getUuid(),
            });
        } else {
            object = await DataService.findNotNullById(view.$view.entity, view.id, {transaction: context.transaction});
            oldObject = object.toJSON();
        }

        const newObject: any = object.toJSON();
        const fields: Dictionary<EntityField, keyof ENTITY> = ModelService.getFields(view.$view.entity.name);
        for (const [key, newValue] of Object.entries(view)) {
            const viewField: ViewFieldDefinition<any, any> = view.$view.fields.find(f => f.name === key);
            if (viewField) {
                const permissions: Dictionary<boolean> = {
                    ...(parentFieldPermissions ?? {}),
                    ...this.permissionService.getViewFieldPermissions(view.$view, viewField, context),
                };
                if ((view.isNew && permissions.canCreate) || (!view.isNew && permissions.canUpdate)) {
                    if (newValue !== undefined) {
                        const field: EntityField | undefined = fields[key];
                        if (field instanceof CompositionField) {
                            const myValue: DataObject<any> | undefined = await object[this.getObjectFunction(object, field, "get")]({transaction: context.transaction}) as DataObject<any> | undefined;
                            if (newValue === null && myValue) {
                                // Remove object:
                                view[key] = null;
                                object.set(field.foreignKey as any, null);
                                newObject[key] = null;
                            } else if (newValue) {
                                // Change object content or save new object:
                                const newValueView: View<any> = await this.saveInternal(newValue, context, permissions);
                                newObject[key] = newValue.toJSON();
                                object.set(field.foreignKey as any, newValueView.id);
                                newObject[field.foreignKey] = newValueView.id;
                                view[key] = newValueView;
                            }
                        } else if (field instanceof ReferenceField) {
                            let id: string | null;
                            if (newValue === null) {
                                id = null;
                            } else {
                                id = typeof newValue === "string" ? newValue : newValue.id;
                            }
                            object.set(field.foreignKey as any, id);
                            newObject[field.foreignKey] = id;
                            if (viewField.subView) {
                                if (ModelService.isVirtualEntity(field.classGetter())) {
                                    object.set(field.name, id);
                                } else {
                                    object[field.name] = await object[this.getObjectFunction(object, field, "get")]({transaction: context.transaction}) as DataObject<any>;
                                }
                            } else {
                                object[field.name] = id;
                            }
                        } else if (field instanceof CollectionField) {
                            const myValue: DataObject<any>[] = await object[this.getObjectFunction(object, field, "get")]({transaction: context.transaction}) as DataObject<any>[] ?? [];
                            const newData: any[] = [];
                            if (newValue == null && permissions.canRemove) {
                                object.set(key as any, []);
                                newObject[key] = [];
                                view[key] = [];
                            } else {
                                for (const d of newValue) {
                                    if (field.composition && typeof d === "object") {
                                        if (!d.isNew || permissions.canInsert) {
                                            d[field.mappedBy] = object.id;
                                            Object.assign(d, await this.saveInternal(d, context, permissions));
                                        }
                                    }
                                    newData.push(d);
                                }
                            }

                            const newDataIds: uuid[] = newData.map(d => typeof d === "string" ? d : d.id);
                            const deletedObjects = myValue.filter((obj: DataObject<any>) => !newDataIds.includes(obj.id));
                            if (field.composition && permissions.canRemove) {
                                await Promise.all(deletedObjects.map(async deletedObject => deletedObject.destroy({transaction: context.transaction})));
                            }
                            await object[this.getObjectFunction(object, field, "set")](newDataIds, {transaction: context.transaction});
                            newObject[key] = newData;
                            view[key] = newData;
                        } else if (field && field.name !== "id" && !field.options?.references) {
                            newObject[key] = newValue;
                            object.set(key as any, newValue);
                        }
                    }
                }
            }
        }

        const isNewRecord: boolean = object.isNewRecord;
        await this.executeBeforeHooks(object, context, oldObject);
        await object.save({transaction: context.transaction});
        await this.executeAfterHooks(object, context, isNewRecord, oldObject);
        return this.viewHelperService.wrap(await object.reload({transaction: context.transaction}), view.$view, object.$entity);
    }

    private getObjectFunction<ENTITY extends DataObject<ENTITY>>(object: DataObject<ENTITY>,
                                                                 field: EntityField,
                                                                 prefix: string) {
        return `${prefix}${field.name.substr(0, 1).toUpperCase()}${field.name.substr(1)}`;
    }

    private async executeBeforeHooks(object: DataObject<any>, context: RequestContext<AbstractUser>, oldObject?: Dictionary<serializable>): Promise<void> {
        if (object.isNewRecord) {
            if ((object as unknown as BeforeCreateHook).onBeforeCreate) {
                await (object as unknown as BeforeCreateHook).onBeforeCreate(context);
            }
        }
        if (oldObject && (object as unknown as BeforeUpdateHook).onBeforeUpdate) {
            await (object as unknown as BeforeUpdateHook).onBeforeUpdate(context, oldObject);
        }
    }

    private async executeAfterHooks(object: DataObject<any>, context: RequestContext<AbstractUser>, wasNewRecord: boolean, oldObject?: Dictionary<serializable>): Promise<void> {
        if (wasNewRecord) {
            if ((object as unknown as AfterCreateHook).onAfterCreate) {
                await (object as unknown as AfterCreateHook).onAfterCreate(context);
            }
        } else if (oldObject && (object as unknown as AfterUpdateHook).onAfterUpdate) {
            await (object as unknown as AfterUpdateHook).onAfterUpdate(context, oldObject);
        }
    }

    private checkPermission(viewDefinition: ViewDefinition<any>,
                            method: RequestMethod,
                            context: RequestContext<AbstractUser>): void {
        this.permissionService.checkViewPermission(viewDefinition.viewClass, method, context);
    }
}
