import {DataObject} from "../../model";
import {ViewFieldDefinition} from "../interface/view-field-definition.interface";
import {ConstructorOf} from "../../../../base/constructor-of";
import {View} from "..";
import {AbstractFilter} from "../../filter";
import {AbstractAction} from "../../action";
import {uuid} from "../../../../base/type/uuid.type";
import {Order} from "sequelize";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {EntityModel} from "../../model/type/entity-model.type";
import {ModelService} from "../../model/service/model.service";
import {isEqual, omit} from "lodash";
import {I18nService} from "../../i18n/service/i18n.service";
import {EntityField} from "../../model/interface/entity-field.class";
import {ReferenceField} from "../../model/interface/reference-field.class";
import {CollectionField} from "../../model/interface/collection-field.class";
import {ManyToManyField} from "../../model/interface/many-to-many-field.class";
import {AbstractUser, UuidService} from "../../../..";
import {RequestContext} from "../../router/interface/request-context.interface";
import {ViewDefinitionConfiguration} from "../interface/view-definition-configuration.interface";
import {ActionDefinition} from "../../action/interface/action-definition.interface";

export class ViewDefinition<ENTITY extends DataObject<ENTITY>> implements ViewDefinitionConfiguration<ENTITY> {
    id: uuid;
    viewClass: ConstructorOf<View<ENTITY>>;
    fields: ViewFieldDefinition<ENTITY, any>[];

    actions: ConstructorOf<AbstractAction>[];
    defaultOrder: Order;
    entity: ConstructorOf<ENTITY>;

    filter?(context: RequestContext<AbstractUser>): AbstractFilter;

    searchAttributes?: string[];

    constructor(entity: ConstructorOf<ENTITY>,
                viewClass: ConstructorOf<View<ENTITY>>,
                fields: ViewFieldDefinition<ENTITY, any>[],
                configuration?: ViewDefinitionConfiguration<ENTITY>) {
        this.viewClass = viewClass;
        this.fields = fields;
        this.actions = configuration?.actions ?? [];
        this.defaultOrder = configuration?.defaultOrder ?? [["id", "ASC"]];
        this.entity = entity;
        this.filter = configuration?.filter;
        this.searchAttributes = configuration?.searchAttributes;
    }

    public getModel(language?: string, path?: string): Dictionary<serializable> {
        if (path) {
            const pathTokens: string[] = path.split("/");
            let token: string = pathTokens.shift();
            while (UuidService.isUuid(token)) {
                token = pathTokens.shift();
            }
            let subField = this.fields.find((field: ViewFieldDefinition<ENTITY, any>) => field.name === token);
            if (subField.subView) {
                return new subField.subView().$view.getModel(language, pathTokens.join("/"));
            }
        }

        let model: EntityModel = ModelService.getModel(this.entity.name, this.getFields());
        this.fields.forEach((field: ViewFieldDefinition<ENTITY, any>) => {
            if (field.subView) {
                const subView: ViewDefinition<any> = field.subView.prototype.$view;
                model = {
                    ...model,
                    ...omit(ModelService.getModel(subView.entity.name, subView.getFields()), "$root")
                };
            }
        });

        model.$id = this.id;
        const fields: ViewFieldDefinition<ENTITY, any>[] = [...this.fields];
        fields.sort((a: ViewFieldDefinition<ENTITY, any>, b: ViewFieldDefinition<ENTITY, any>) => a.position - b.position);
        model.$fields = JSON.parse(JSON.stringify(fields));

        return I18nService.parseEntityModel(model, language);
    }


    public getFields(requestedFields?: string[]): string[] {
        let fields: string[] = [];

        // Get all possible fields from view.
        for (const viewField of this.fields) {
            const fieldName: string = viewField.name as string;

            const entityField: EntityField = ModelService.getFields(this.entity.name)[fieldName];
            if (entityField) {
                fields.push(entityField.name);
                if (!entityField.isSimpleField) {
                    if (viewField.subView) {
                        const subView: ViewDefinition<any> = viewField.subView.prototype.$view;
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

    public getActionConfigurations(): ActionDefinition[] {
        return (this.actions ?? []).map(actionClass => actionClass.prototype.$action);
    }
}
