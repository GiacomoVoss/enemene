import {DataObject} from "../../model";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {ModelService} from "../../model/service/model.service";
import {EntityModel} from "../../model/type/entity-model.type";
import {serializable} from "../../../../base/type/serializable.type";
import {ViewFieldDefinition} from "..";
import {I18nService} from "../../i18n/service/i18n.service";
import {ConstructorOf} from "../../../../base/constructor-of";
import {Filter} from "../../filter";
import {AbstractAction} from "../../action";
import {EntityField} from "../../model/interface/entity-field.class";
import {ReferenceField} from "../../model/interface/reference-field.class";
import {CollectionField} from "../../model/interface/collection-field.class";
import {ManyToManyField} from "../../model/interface/many-to-many-field.class";
import {isEqual, omit} from "lodash";
import {Order} from "sequelize";
import {ActionConfiguration} from "../../action/interface/action-configuration.interface";

export class View<ENTITY extends DataObject<ENTITY>> {

    public entity: () => ConstructorOf<ENTITY>;

    public $fields: ViewFieldDefinition<ENTITY>[] = [];

    get filter(): Filter {
        return Filter.true();
    }

    get actions(): ConstructorOf<AbstractAction>[] {
        return [];
    }

    get defaultOrder(): Order {
        return [["id", "ASC"]];
    }

    get searchAttributes(): string[] {
        return [];
    }

    public getActionConfigurations(): ActionConfiguration[] {
        return (this.actions ?? []).map(actionClass => (new actionClass()).getConfiguration());
    }

    public getFields(requestedFields?: string[]): string[] {
        let fields: string[] = [];

        // Get all possible fields from view.
        for (const viewField of this.$fields) {
            const fieldName: string = viewField.name;

            const entityField: EntityField = ModelService.getFields(this.entity().name)[fieldName];
            if (entityField) {
                fields.push(entityField.name);
                if (!entityField.isSimpleField) {
                    if (viewField.subView) {
                        const subView: View<any> = new viewField.subView();
                        fields.push(...subView.getFields().map(field => `${fieldName}.${field}`));
                    } else {
                        fields.push(...ModelService.getDisplayPatternFields((entityField as ReferenceField).classGetter().name).map((field => `${fieldName}.${field.name}`)));
                    }
                }

                if (entityField instanceof CollectionField || entityField instanceof ManyToManyField) {
                    fields.push(`${fieldName}.$count`);
                }
            }
        }

        if (requestedFields && !isEqual(requestedFields, ["*"])) {
            return fields.filter((field: string) => {
                if (field === "id" || field.endsWith(".id")) {
                    return true;
                }

                if (requestedFields.includes(field)) {
                    return true;
                }
                const baseField: string = field.substr(0, field.indexOf("."));
                if (requestedFields.includes(baseField) || requestedFields.includes(`${baseField}.*`) || requestedFields.find((f: string) => f.startsWith(`${baseField}`))) {
                    return true;
                }

                return false;
            });
        }

        return fields;
    }

    public getModel(language?: string): Dictionary<serializable> {
        let model: EntityModel = ModelService.getModel(this.entity().name, this.getFields());
        this.$fields.forEach(field => {
            if (field.subView) {
                const subView: View<any> = new field.subView();
                model = {
                    ...model,
                    ...omit(ModelService.getModel(subView.entity().name, subView.getFields()), "$root")
                };
            }
        });

        model.$fields = JSON.parse(JSON.stringify(this.$fields));

        return I18nService.parseEntityModel(model, language);
    }
}
