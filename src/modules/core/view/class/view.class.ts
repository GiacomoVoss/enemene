import {DataObject} from "../../model";
import {ViewFieldDefinition} from "..";
import {uuid} from "../../../../base/type/uuid.type";
import {get, omit} from "lodash";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {EntityField} from "../../model/interface/entity-field.class";
import {ModelService} from "../../model/service/model.service";
import {ViewDefinition} from "./view-definition.class";
import {UuidService} from "../../../..";
import {InputValidationError} from "../../validation/error/input-validation.error";

export abstract class View<ENTITY extends DataObject<ENTITY>> {

    public $view: ViewDefinition<ENTITY>;

    protected $fields: ViewFieldDefinition<ENTITY, any>[];

    public id: uuid;

    public $displayPattern: string = "{id}";

    public setValues(data: Dictionary<serializable>): void {
        const entityFields: Dictionary<EntityField, keyof ENTITY> = ModelService.getFields(this.$view.entity.name);
        for (const fieldDefinition of this.$fields) {
            const key: string = fieldDefinition.name;
            const field: EntityField = entityFields[fieldDefinition.name];
            if (field) {
                if (typeof data[key] === "object" && data[key] !== undefined && fieldDefinition.subView) {
                    if (Array.isArray(data[key])) {
                        this[key] = (data[key] as Dictionary<serializable>[]).map((subData: Dictionary<serializable>) => {
                            const subView: View<any> = new fieldDefinition.subView();
                            subView.setValues(subData);
                            return subView;
                        });
                    } else {
                        if (this[key] === undefined) {
                            this[key] = new fieldDefinition.subView();
                        }
                        (this[key] as View<any>).setValues(data[key] as Dictionary<serializable>);
                    }
                } else {
                    this[key] = data[key] as any;
                }
            }
        }
        this.id = (data.id as string | undefined) ?? this.id;
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
                    throw new InputValidationError([{
                        type: "field",
                        field: "attributePath",
                        message: `Invalid attribute path: ${path}`,
                    }]);
                }
            } else {
                data = get(data, token);
            }
        }

        return data;
    }

    public toJSON(): object {
        return {
            ...omit(this, "$view", "$fields"),
            $entity: this.$view.entity.name,
        };
    }
}
