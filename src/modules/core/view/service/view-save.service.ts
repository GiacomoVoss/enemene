import {DataObject} from "../../model";
import {Transaction} from "sequelize";
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

export class ViewSaveService {

    private validationService: ValidationService = Enemene.app.inject(ValidationService);
    private viewFindService: ViewFindService = Enemene.app.inject(ViewFindService);
    private permissionService: PermissionService = Enemene.app.inject(PermissionService);

    public async save<ENTITY extends DataObject<ENTITY>>(view: View<ENTITY>,
                                                         context: RequestContext<AbstractUser>): Promise<View<ENTITY>> {
        const viewId: uuid = await this.saveInTransaction(context.transaction, view, context);
        return this.viewFindService.findById(view.$view.viewClass, viewId, context);
    }

    private async saveInTransaction<ENTITY extends DataObject<ENTITY>>(transaction: Transaction,
                                                                       view: View<ENTITY>,
                                                                       context: RequestContext<AbstractUser>): Promise<uuid> {
        if (view.isNew) {
            this.checkPermission(view.$view, RequestMethod.POST, context);
        } else {
            this.checkPermission(view.$view, RequestMethod.PUT, context);
        }
        this.validationService.validateView(view, context);

        const object: DataObject<ENTITY> = view.isNew ? new view.$view.entity() : await DataService.findById(view.$view.entity, view.id, {transaction});
        const rawObject: any = object.toJSON();
        const fields: Dictionary<EntityField, keyof ENTITY> = ModelService.getFields(view.$view.entity.name);
        for (const [key, newValue] of Object.entries(view)) {
            if (newValue !== undefined) {
                const field: EntityField | undefined = fields[key];
                if (field instanceof CompositionField) {
                    const myValue: DataObject<any> | undefined = await object[this.getObjectFunction(object, field, "get")]({transaction}) as DataObject<any> | undefined;
                    if (newValue === null && myValue) {
                        // Remove object:
                        view[key] = null;
                        object.set(field.foreignKey as any, null);
                        rawObject[key] = null;
                    } else if (newValue) {
                        // Change object content or save new object:
                        const newValueId: uuid = await this.saveInTransaction(transaction, newValue, context);
                        rawObject[key] = newValue.toJSON();
                        if (newValueId !== myValue?.id) {
                            object.set(field.foreignKey as any, newValueId);
                            rawObject[field.foreignKey] = newValueId;
                        }
                    }
                } else if (field instanceof ReferenceField) {
                    const id: string = typeof newValue === "string" ? newValue : newValue.id;
                    object.set(field.foreignKey as any, id);
                    rawObject[field.foreignKey] = id;
                } else if (field instanceof CollectionField) {
                    const myValue: DataObject<any>[] = await object[this.getObjectFunction(object, field, "get")]({transaction}) as DataObject<any>[] ?? [];
                    const newData: any[] = [];
                    if (newValue == null) {
                        object.set(key as any, []);
                        rawObject[key] = [];
                        view[key] = [];
                    } else {
                        for (const d of newValue) {
                            if (field.composition && typeof d === "object") {
                                await this.saveInTransaction(transaction, d, context);
                            }
                            newData.push(d);
                        }
                    }

                    const newDataIds: uuid[] = newData.map(d => typeof d === "string" ? d : d.id);
                    const deletedObjects = myValue.filter((obj: DataObject<any>) => !newDataIds.includes(obj.id));
                    if (field.composition) {
                        await Promise.all(deletedObjects.map(async deletedObject => await deletedObject.destroy({transaction})));
                    }
                    await object[this.getObjectFunction(object, field, "set")](newDataIds, {transaction});
                    rawObject[key] = newData;
                    view[key] = newData;
                } else if (field && field.name !== "id" && !field.options?.references) {
                    rawObject[key] = newValue;
                    object.set(key as any, newValue);
                }
            }
        }

        const isNewRecord: boolean = object.isNewRecord;
        await this.executeBeforeHooks(object, context);
        await object.save({transaction});
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