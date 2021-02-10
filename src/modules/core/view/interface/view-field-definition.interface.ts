import {DataObject} from "../../model";
import {View} from "../class/view.class";
import {ConstructorOf} from "../../../../base/constructor-of";
import {ViewFieldConfiguration} from "../decorator/view-field.decorator";
import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUser} from "../../auth";

export class ViewFieldDefinition<ENTITY extends DataObject<ENTITY>, SUBENTITY extends DataObject<SUBENTITY>> {
    public name: keyof View<ENTITY>;
    public position: number;
    public required: boolean;
    public fieldType?: any;
    public subView?: ConstructorOf<View<SUBENTITY>>;
    public isArray: boolean = false;
    public canUpdate?: boolean = false;
    public canCreate?: boolean = false;
    public canInsert?: boolean = false;
    public canRemove?: boolean = false;
    public default: (context: RequestContext<AbstractUser>) => any;
    private meta?: any;

    constructor(name: keyof View<ENTITY>, fieldType: any, configuration: ViewFieldConfiguration<SUBENTITY, View<SUBENTITY>>) {
        this.name = name;
        this.position = configuration.position;
        this.required = configuration.required;
        this.fieldType = fieldType;
        this.subView = configuration.subView;
        this.isArray = fieldType.name === "Array";
        this.meta = configuration.meta;
        this.canUpdate = configuration.canUpdate;
        this.canCreate = configuration.canCreate;
        this.canInsert = configuration.canInsert;
        this.canRemove = configuration.canRemove;
        this.default = configuration.default;
    }

    toJSON() {
        return {
            position: this.position,
            name: this.name,
            required: this.required,
            subView: this.subView?.name,
            isArray: this.isArray,
            meta: this.meta,
            canUpdate: this.canUpdate,
            canCreate: this.canCreate,
            canInsert: this.canInsert,
            canRemove: this.canRemove,
        };
    }
}
