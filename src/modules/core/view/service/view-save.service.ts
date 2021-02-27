import {DataObject} from "../../model";
import {View} from "../class/view.class";
import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUser, PermissionService} from "../../auth";
import {uuid} from "../../../../base/type/uuid.type";
import {AfterCreateHook, BeforeCreateHook, DataService} from "../../data";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {EntityField} from "../../model/interface/entity-field.class";
import {ModelService} from "../../model/service/model.service";
import {CompositionField} from "../../model/interface/composition-field.class";
import {ReferenceField} from "../../model/interface/reference-field.class";
import {CollectionField} from "../../model/interface/collection-field.class";
import {ValidationService} from "../../validation/service/validation.service";
import {Enemene} from "../../application";
import {ViewFindService} from "./view-find.service";
import {RequestMethod} from "../../router/enum/request-method.enum";
import {ViewDefinition} from "../class/view-definition.class";
import {UuidService} from "../../service/uuid.service";
import {ViewFieldDefinition} from "../class/view-field-definition.class";

export class ViewSaveService {

    private validationService: ValidationService = Enemene.app.inject(ValidationService);
    private viewFindService: ViewFindService = Enemene.app.inject(ViewFindService);
    private permissionService: PermissionService = Enemene.app.inject(PermissionService);

    public async save<ENTITY extends DataObject<ENTITY>>(view: View<ENTITY>,
                                                         context: RequestContext<AbstractUser>): Promise<View<ENTITY>> {
        if (view.isNew) {
            this.checkPermission(view.$view, RequestMethod.POST, context);
        } else {
            this.checkPermission(view.$view, RequestMethod.PUT, context);
        }
        const viewId: uuid = await this.saveInternal(view, context);
        return this.viewFindService.findById(view.$view.viewClass, viewId, context);
    }

    private async saveInternal<ENTITY extends DataObject<ENTITY>>(view: View<ENTITY>,
                                                                  context: RequestContext<AbstractUser>,
                                                                  parentFieldPermissions?: Dictionary<boolean>): Promise<uuid> {
        this.validationService.validateView(view, context);
        let object: DataObject<ENTITY>;
        if (view.isNew) {
            object = new view.$view.entity({
                id: view.id ?? UuidService.getUuid(),
            });
        } else {
            object = await DataService.findNotNullById(view.$view.entity, view.id, {transaction: context.transaction});
        }
        const rawObject: any = object.toJSON();
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
                                rawObject[key] = null;
                            } else if (newValue) {
                                // Change object content or save new object:
                                const newValueId: uuid = await this.saveInternal(newValue, context);
                                rawObject[key] = newValue.toJSON();
                                if (newValueId !== myValue?.id) {
                                    object.set(field.foreignKey as any, newValueId);
                                    rawObject[field.foreignKey] = newValueId;
                                }
                            }
                        } else if (field instanceof ReferenceField) {
                            let id: string;
                            if (newValue === null) {
                                id = null;
                            } else {
                                id = typeof newValue === "string" ? newValue : newValue.id;
                            }
                            object.set(field.foreignKey as any, id);
                            rawObject[field.foreignKey] = id;
                        } else if (field instanceof CollectionField) {
                            const myValue: DataObject<any>[] = await object[this.getObjectFunction(object, field, "get")]({transaction: context.transaction}) as DataObject<any>[] ?? [];
                            const newData: any[] = [];
                            if (newValue == null && permissions.canRemove) {
                                object.set(key as any, []);
                                rawObject[key] = [];
                                view[key] = [];
                            } else {
                                for (const d of newValue) {
                                    if (field.composition && typeof d === "object") {
                                        if (!d.isNew || permissions.canInsert) {
                                            await this.saveInternal(d, context, permissions);
                                        }
                                    }
                                    newData.push(d);
                                }
                            }

                            const newDataIds: uuid[] = newData.map(d => typeof d === "string" ? d : d.id);
                            const deletedObjects = myValue.filter((obj: DataObject<any>) => !newDataIds.includes(obj.id));
                            if (field.composition && permissions.canRemove) {
                                await Promise.all(deletedObjects.map(async deletedObject => await deletedObject.destroy({transaction: context.transaction})));
                            }
                            await object[this.getObjectFunction(object, field, "set")](newDataIds, {transaction: context.transaction});
                            rawObject[key] = newData;
                            view[key] = newData;
                        } else if (field && field.name !== "id" && !field.options?.references) {
                            rawObject[key] = newValue;
                            object.set(key as any, newValue);
                        }
                    }
                }
            }
        }

        const isNewRecord: boolean = object.isNewRecord;
        await this.executeBeforeHooks(object, context);
        await object.save({transaction: context.transaction});
        await this.executeAfterHooks(object, context, isNewRecord);
        view.id = object.id;
        view.isNew = false;
        return object.id;
    }

    private getObjectFunction<ENTITY extends DataObject<ENTITY>>(object: DataObject<ENTITY>,
                                                                 field: EntityField,
                                                                 prefix: string) {
        return `${prefix}${field.name.substr(0, 1).toUpperCase()}${field.name.substr(1)}`;
    }

    private async executeBeforeHooks(object: DataObject<any>, context: RequestContext<AbstractUser>): Promise<void> {
        if (object.isNewRecord) {
            if ((object as unknown as BeforeCreateHook).onBeforeCreate) {
                await (object as unknown as BeforeCreateHook).onBeforeCreate(context);
            }
        }
    }

    private async executeAfterHooks(object: DataObject<any>, context: RequestContext<AbstractUser>, wasNewRecord: boolean): Promise<void> {
        if (wasNewRecord) {
            if ((object as unknown as AfterCreateHook).onAfterCreate) {
                await (object as unknown as AfterCreateHook).onAfterCreate(context);
            }
        }
    }

    private checkPermission(viewDefinition: ViewDefinition<any>,
                            method: RequestMethod,
                            context: RequestContext<AbstractUser>): void {
        this.permissionService.checkViewPermission(viewDefinition.viewClass, method, context);
    }
}