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
import {ModelService} from "../../model/service/model.service";
import {isEqual} from "lodash";
import {I18nService} from "../../i18n/service/i18n.service";
import {EntityField} from "../../model/interface/entity-field.class";
import {ReferenceField} from "../../model/interface/reference-field.class";
import {CollectionField} from "../../model/interface/collection-field.class";
import {ManyToManyField} from "../../model/interface/many-to-many-field.class";
import {AbstractUser, UuidService} from "../../../..";
import {RequestContext} from "../../router/interface/request-context.interface";
import {ViewDefinitionConfiguration} from "../interface/view-definition-configuration.interface";
import {ActionDefinition} from "../../action/interface/action-definition.interface";
import {Validate} from "../../validation/class/validate.class";
import {AbstractValidate} from "../../validation/class/abstract-validate.class";
import {ViewModel} from "../../model/type/view-model.type";
import {PermissionService} from "../../auth/service/permission.service";

export class ViewDefinition<ENTITY extends DataObject<ENTITY>> implements ViewDefinitionConfiguration<ENTITY> {
    id: uuid;
    viewClass: ConstructorOf<View<ENTITY>>;
    fields: ViewFieldDefinition<ENTITY, any>[];

    validation?: AbstractValidate;

    actions: ConstructorOf<AbstractAction>[];
    defaultOrder: Order;

    filter?(context: RequestContext<AbstractUser>): AbstractFilter;

    creatable: boolean = false;
    updatable: boolean = false;
    deletable: boolean = false;

    searchAttributes?: string[];

    meta?: object;

    private _entity: () => ConstructorOf<ENTITY>;

    get entity(): ConstructorOf<ENTITY> {
        return this._entity();
    }

    constructor(id: uuid,
                entity: () => ConstructorOf<ENTITY>,
                viewClass: ConstructorOf<View<ENTITY>>,
                fields: ViewFieldDefinition<ENTITY, any>[],
                configuration?: ViewDefinitionConfiguration<ENTITY>) {
        this.id = id;
        this.viewClass = viewClass;
        this.actions = configuration?.actions ?? [];
        this.defaultOrder = configuration?.defaultOrder ?? [["id", "ASC"]];
        this._entity = entity;
        this.filter = configuration?.filter;
        this.searchAttributes = configuration?.searchAttributes;
        this.meta = configuration?.meta;
        this.creatable = configuration?.creatable ?? false;
        this.updatable = configuration?.updatable ?? false;
        this.deletable = configuration?.deletable ?? false;

        this.fields = fields.map(viewField => {
            viewField.canCreate = viewField.canCreate ?? this.creatable;
            viewField.canUpdate = viewField.canUpdate ?? this.updatable;
            viewField.canInsert = viewField.isArray ? viewField.canInsert ?? this.updatable : false;
            viewField.canRemove = viewField.isArray ? viewField.canRemove ?? this.updatable : false;

            return viewField;
        });

        const requiredFields: AbstractValidate[] = fields
            .filter((field: ViewFieldDefinition<ENTITY, any>) => field.required)
            .map((field: ViewFieldDefinition<ENTITY, any>) => field.name)
            .map(Validate.exists);

        if (requiredFields.length) {
            if (this.validation) {
                this.validation = Validate.and(this.validation, ...requiredFields);
            } else {
                this.validation = Validate.and(...requiredFields);
            }
        }
    }

    public getModel(language?: string, path?: string): Dictionary<serializable, uuid> {
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

        const myModel: Dictionary<EntityField> = ModelService.getModel(this.entity.name, this.fields.map(f => f.name));
        const fields: ViewFieldDefinition<ENTITY, any>[] = [...this.fields];
        fields.sort((a: ViewFieldDefinition<ENTITY, any>, b: ViewFieldDefinition<ENTITY, any>) => a.position - b.position);

        const myParsedModel: Dictionary<serializable> = {
            ...PermissionService.addViewPermissions(I18nService.parseEntityModel(myModel, language), this),
            $fields: fields.map(f => f.name),
        };

        let fullModel: ViewModel = {
            $root: this.id,
            $view: this.viewClass.name,
            $meta: this.meta,
            [this.id]: myParsedModel,
        };

        fullModel = this.fields
            .filter(f => f.subView)
            .reduce((m: ViewModel, field: ViewFieldDefinition<ENTITY, any>) => {
                const subView: ViewDefinition<any> = field.subView.prototype.$view;
                const subViewModel: Dictionary<serializable, uuid> = subView.getModel(language);
                m[this.id][field.name].view = subView.id;
                m[subView.id] = {
                    ...(subViewModel[subView.id] as Dictionary<serializable>),
                    $fields: subViewModel.$fields,
                };
                return m;
            }, fullModel);

        return fullModel;
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
