import {Dictionary} from "../../../../base/type/dictionary.type";
import {EntityField} from "../../model/interface/entity-field.class";
import {ModelService} from "../../model/service/model.service";
import {CompositionField} from "../../model/interface/composition-field.class";
import {ReferenceField} from "../../model/interface/reference-field.class";
import {uuid} from "../../../../base/type/uuid.type";
import {serializable} from "../../../../base/type/serializable.type";
import {CollectionField} from "../../model/interface/collection-field.class";
import {DataObject} from "../../model";
import {Transaction} from "sequelize/types/lib/transaction";
import {Enemene} from "../../application";
import {UuidService} from "../../service/uuid.service";

export class DataHelperService {

    public static async populate<ENTITY extends DataObject<ENTITY>>(object: ENTITY, data: Dictionary<any>, transaction: Transaction): Promise<DataObject<ENTITY>> {
        const changedObject: any = {};
        const fields: Dictionary<EntityField, keyof ENTITY> = ModelService.getFields(object.$entity);
        for (const [key, field] of Object.entries(fields)) {
            if (field instanceof CompositionField) {
                if (data[key]) {
                    const myData: DataObject<any> | undefined = object.get(key) as DataObject<any> | undefined;
                    const subObjectData: Dictionary<any> = data[key] ?? data[field.foreignKey] ?? object.get(key) ?? object.get(field.foreignKey);
                    if (!subObjectData.id) {
                        subObjectData.id = UuidService.getUuid();
                        await field.classGetter().create(subObjectData, {transaction});
                    }
                    changedObject[key] = {
                        ...(myData ?? {}),
                        ...subObjectData,
                    };
                    changedObject[field.foreignKey] = myData?.id ?? subObjectData?.id;
                }
            } else if (field instanceof ReferenceField) {
                const subObjectData: uuid | Dictionary<serializable> = data[key] ?? data[field.foreignKey];
                const myData: DataObject<any> | string | undefined = object.get(key) as DataObject<any> | string | undefined;
                if (subObjectData) {
                    if (typeof subObjectData === "string") {
                        if (typeof myData === "string" && myData !== subObjectData || typeof myData === "object" && myData.id !== subObjectData) {
                            changedObject[field.foreignKey] = subObjectData;
                        }
                    } else {
                        if (typeof myData === "string" && myData !== subObjectData.id || typeof myData === "object" && myData.id !== subObjectData.id) {
                            changedObject[key] = subObjectData.id;
                        }
                    }
                }
            } else if (field instanceof CollectionField && data[key]) {
                const myData: DataObject<any>[] = object.get(key) as DataObject<any>[] ?? [];
                const newData: object[] = [];
                for (const d of data[key]) {
                    const id: string = typeof d === "string" ? d : d.id as string;
                    const myObj: DataObject<any> | undefined = myData.find(o => o.id === id);
                    if (typeof d === "string") {
                        newData.push({id: d});
                    } else {
                        if (field.composition) {
                            if (myObj) {
                                newData.push(await DataHelperService.populate(myObj, d, transaction));
                            } else {
                                newData.push(d);
                            }
                        }
                    }
                }

                const deletedObjects = myData.filter((obj: DataObject<any>) => !newData.map((o: any) => o.id).includes(obj.id));
                if (field.composition) {
                    await Promise.all(deletedObjects.map(async deletedObject => await deletedObject.destroy({transaction})));
                }
                changedObject[key] = newData;
            } else if (data[key] !== undefined) {
                changedObject[key] = data[key];
            }
        }

        console.log(changedObject);

        return Enemene.app.db.model(object.$entity).build(changedObject) as DataObject<ENTITY>;
    }

    private static getFieldSetter(prefix: string, field: EntityField): string {
        return `${prefix}${field.name.substr(0, 1).toUpperCase()}${field.name.substr(1)}`;
    }
}