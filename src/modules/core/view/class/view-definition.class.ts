import {DataObject} from "../../model";
import {ViewFieldDefinition} from "../class/view-field-definition.class";
import {ConstructorOf} from "../../../../base/constructor-of";
import {View} from "..";
import {AbstractFilter} from "../../filter";
import {AbstractAction} from "../../action";
import {uuid} from "../../../../base/type/uuid.type";
import {Order} from "sequelize";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {ModelService} from "../../model/service/model.service";
import {I18nService} from "../../i18n/service/i18n.service";
import {EntityField} from "../../model/interface/entity-field.class";
import {AbstractUser, Enemene, UuidService} from "../../../..";
import {RequestContext} from "../../router/interface/request-context.interface";
import {ViewDefinitionConfiguration} from "../interface/view-definition-configuration.interface";
import {ActionDefinition} from "../../action/interface/action-definition.interface";
import {Validate} from "../../validation/class/validate.class";
import {AbstractValidate} from "../../validation/class/abstract-validate.class";
import {ViewModel} from "../../model/type/view-model.type";
import {PermissionService} from "../../auth/service/permission.service";
import {uniq} from "lodash";

export class ViewDefinition<ENTITY extends DataObject<ENTITY>> implements ViewDefinitionConfiguration<ENTITY> {
    id: uuid;
    viewClass: ConstructorOf<View<ENTITY>>;
    fields: ViewFieldDefinition<ENTITY, any>[];

    private validation?: AbstractValidate;

    actions: ConstructorOf<AbstractAction>[];
    defaultOrder: Order;

    filter?(context: RequestContext<AbstractUser>): AbstractFilter;

    searchAttributes?: string[];

    meta?: object;

    private _entity: () => ConstructorOf<ENTITY>;

    get entity(): ConstructorOf<ENTITY> | undefined {
        return this._entity?.();
    }

    constructor(id: uuid,
                entity: () => ConstructorOf<ENTITY> | undefined,
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

        this.fields = fields ?? [];
    }

    public getValidation(): AbstractValidate {
        const requiredViewFields: string[] = this.fields
            .filter((field: ViewFieldDefinition<ENTITY, any>) => field.required)
            .map((field: ViewFieldDefinition<ENTITY, any>) => field.name);

        const entityFields: Dictionary<EntityField> = this.entity ? ModelService.getFields(this.entity.name) : {};
        const requiredEntityFields: string[] = this.fields
            .map(field => entityFields[field.name])
            .filter(field => field?.required)
            .map(field => field.name);

        let validation: AbstractValidate;
        if (requiredViewFields.length || requiredEntityFields.length) {
            const requiredFields: string[] = uniq([...requiredViewFields, ...requiredEntityFields]);
            const requiredFieldsValidation: AbstractValidate[] = requiredFields.map(Validate.exists);
            if (this.validation) {
                validation = Validate.and(this.validation, ...requiredFieldsValidation);
            } else {
                validation = Validate.and(...requiredFieldsValidation);
            }
        }

        return validation;
    }

    public getModel(context: RequestContext<AbstractUser>, path?: string, parentFieldPermissions?: Dictionary<boolean>): Dictionary<serializable, uuid> {
        if (!this.entity) {
            return {};
        }
        if (path && !UuidService.isUuid(path)) {
            const pathTokens: string[] = path.split("/");
            let token: string = pathTokens.shift();
            while (UuidService.isUuid(token)) {
                token = pathTokens.shift();
            }
            let subField = this.fields.find((field: ViewFieldDefinition<ENTITY, any>) => field.name === token);
            if (subField.subView) {
                return new subField.subView().$view.getModel(context, pathTokens.join("/"), Enemene.app.inject(PermissionService).getViewFieldPermissions(this, subField, context));
            }
        }

        const myModel: Dictionary<EntityField> = ModelService.getModel(this.entity.name, this.fields.map(f => f.name));
        const fields: ViewFieldDefinition<ENTITY, any>[] = [...this.fields];
        fields.sort((a: ViewFieldDefinition<ENTITY, any>, b: ViewFieldDefinition<ENTITY, any>) => a.position - b.position);

        const fieldPermissions: Dictionary<Dictionary<boolean>> = fields.reduce((result: Dictionary<Dictionary<boolean>>, field: ViewFieldDefinition<ENTITY, any>) => {
            result[field.name] = Enemene.app.inject(PermissionService).getViewFieldPermissions(this, field, context);
            return result;
        }, {});

        const myParsedModel: Dictionary<serializable> = {
            ...I18nService.parseEntityModel(myModel, context.language),
            $fields: fields.map(f => f.name),
        };
        Object.entries(myParsedModel).forEach(([key, field]) => {
            if (key !== "$fields") {
                Object.assign(field, parentFieldPermissions, fieldPermissions[key]);
            }
        });

        let fullModel: ViewModel = {
            $root: this.id,
            $view: this.viewClass.name,
            $meta: this.meta,
            $entity: this.entity?.name,
            [this.id]: myParsedModel,
        };

        fullModel = this.fields
            .filter(f => f.subView)
            .reduce((m: ViewModel, field: ViewFieldDefinition<ENTITY, any>) => {
                const subView: ViewDefinition<any> = field.subView.prototype.$view;
                const subViewModel: Dictionary<serializable, uuid> = subView.getModel(context, undefined, fieldPermissions[field.name]);
                m[this.id][field.name].view = subView.id;
                m[subView.id] = {
                    ...(subViewModel[subView.id] as Dictionary<serializable>),
                    $fields: subViewModel.$fields,
                };
                return m;
            }, fullModel);

        return fullModel;
    }

    public getActionConfigurations(): ActionDefinition[] {
        return (this.actions ?? []).map(actionClass => actionClass.prototype.$action);
    }
}
