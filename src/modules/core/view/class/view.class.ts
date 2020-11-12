import {DataObject} from "../../model";
import {ViewFieldDefinition} from "..";
import {uuid} from "../../../../base/type/uuid.type";
import {omit} from "lodash";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {EntityField} from "../../model/interface/entity-field.class";
import {ModelService} from "../../model/service/model.service";
import {ViewDefinition} from "./view-definition.class";

export abstract class View<ENTITY extends DataObject<ENTITY>> {

    public $view: ViewDefinition<ENTITY>;

    protected $fields: ViewFieldDefinition<ENTITY, any>[];

    public id: uuid;

    public $displayPattern: string = "{id}";

    setValues(data: Dictionary<serializable>): void {
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
    }

    toJSON(): object {
        return {
            ...omit(this, "$view", "$fields"),
            $entity: this.$view.entity.name,
        };
    }
}
