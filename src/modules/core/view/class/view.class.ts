import {DataObject} from "../../model";
import {ViewFieldDefinition} from "..";
import {uuid} from "../../../../base/type/uuid.type";
import {get, pick} from "lodash";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {EntityField} from "../../model/interface/entity-field.class";
import {ModelService} from "../../model/service/model.service";
import {ViewDefinition} from "./view-definition.class";
import {AbstractUser, UuidService} from "../../../..";
import {ConstructorOf} from "../../../../base/constructor-of";
import {RequestContext} from "../../router/interface/request-context.interface";

export abstract class View<ENTITY extends DataObject<ENTITY>> {

    public $view: ViewDefinition<ENTITY>;

    protected $fields: ViewFieldDefinition<ENTITY, any>[];

    public id: uuid;

    public $displayPattern: string = "{id}";

    public isNew: boolean = true;

    public setValues(data: Dictionary<serializable>, context: RequestContext<AbstractUser>): void {
        const entityFields: Dictionary<EntityField, keyof ENTITY> = ModelService.getFields(this.$view.entity.name);
        for (const fieldDefinition of this.$view.fields) {
            if (!fieldDefinition.calculated) {
                const key: string = fieldDefinition.name;
                const field: EntityField = entityFields[fieldDefinition.name];
                if (field) {
                    if (typeof data[key] === "object" && data[key] !== undefined && fieldDefinition.subView) {
                        if (data[key] === null) {
                            this[key] = null;
                        } else if (Array.isArray(data[key])) {
                            this[key] = (data[key] as Dictionary<serializable>[]).map((subData: Dictionary<serializable>) => {
                                return this.createOrUpdateView(subData, fieldDefinition.subView, context);
                            });
                        } else {
                            this[key] = this.createOrUpdateView(data[key] as any, fieldDefinition.subView, context);
                        }
                    } else if (data[key] !== undefined) {
                        this[key] = data[key] as any;
                    }
                    if ((this[key] === undefined || this[key] === null) && (data[key] === undefined || data[key] === null)) {
                        if (fieldDefinition.default) {
                            this[key] = fieldDefinition.default(context);
                        }
                    }
                }
            }
        }
        if (data.id) {
            this.isNew = false;
        }
        this.id = (data.id as string | undefined) ?? this.id;
    }

    private createOrUpdateView(viewData: Dictionary<serializable> | View<any>, viewClass: ConstructorOf<View<any>>, context: RequestContext<AbstractUser>): View<any> {
        if (viewData instanceof View) {
            return viewData;
        } else {
            const subView: View<any> = new viewClass();
            subView.setValues(viewData, context);
            return subView;
        }
    }

    public getByPath(path: string): any {
        if (!path.length) {
            return this;
        }

        const attributeTokens: string[] = path.split("/");
        let data = this;

        for (const token of attributeTokens) {
            if (Array.isArray(data)) {
                if (UuidService.isUuid(token)) {
                    data = data.find((obj: any) => obj.id === token);
                } else if (!isNaN(Number.parseInt(token))) {
                    data = data[Number.parseInt(token)];
                } else {
                    throw new Error(`Invalid attribute path: ${path}`);
                }
            } else {
                data = get(data, token);
            }
        }

        return data;
    }

    public toJSON(): object {
        const fields: string[] = this.$fields?.map(field => field.name) ?? Object.getOwnPropertyNames(this);
        return {
            id: this.id,
            $entity: this.$view.entity.name,
            $displayPattern: this.$displayPattern,
            ...pick(this, ...fields),
        };
    }
}
