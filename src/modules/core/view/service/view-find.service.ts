import {DataObject} from "../../model";
import {ViewDefinition} from "../class/view-definition.class";
import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUser, PermissionService} from "../../auth";
import {View} from "../class/view.class";
import {ConstructorOf} from "../../../../base/constructor-of";
import {AbstractFilter, FilterService} from "../../filter";
import {ViewFindOptions} from "../interface/view-find-options.interface";
import {DataService} from "../../data";
import {uuid} from "../../../../base/type/uuid.type";
import {Enemene} from "../../application";
import {RequestMethod} from "../../router/enum/request-method.enum";
import {ViewHelperService} from "./view-helper.service";
import {ViewInitializerService} from "./view-initializer.service";

export class ViewFindService {

    private viewHelperService: ViewHelperService = Enemene.app.inject(ViewHelperService);
    private permissionService: PermissionService = Enemene.app.inject(PermissionService);

    public async count<ENTITY extends DataObject<ENTITY>, VIEW extends View<ENTITY>>(viewClass: ConstructorOf<VIEW>,
                                                                                     context: RequestContext<AbstractUser>,
                                                                                     filter?: AbstractFilter,
                                                                                     searchString?: string): Promise<number> {
        this.checkPermission(viewClass, context);
        return (await this.findAll(viewClass, context, filter, {searchString})).length;
    }

    public async findAll<ENTITY extends DataObject<ENTITY>, VIEW extends View<ENTITY>>(viewClass: ConstructorOf<VIEW>,
                                                                                       context: RequestContext<AbstractUser>,
                                                                                       filter?: AbstractFilter,
                                                                                       options?: ViewFindOptions): Promise<VIEW[]> {
        this.checkPermission(viewClass, context);
        const viewDefinition: ViewDefinition<ENTITY> = ViewInitializerService.getViewDefinition(viewClass.name);
        const data: DataObject<ENTITY>[] = await DataService.findAllRaw(viewDefinition.entity, {
            ...this.viewHelperService.getFindOptions(viewDefinition, context, {
                ...FilterService.toSequelize(filter, viewDefinition.entity),
                ...options,
            }, options?.searchString),
            transaction: context.transaction,
        });
        return data.map((object: DataObject<ENTITY>) => this.viewHelperService.wrap(object, viewDefinition)) as VIEW[];
    }

    public async findOne<ENTITY extends DataObject<ENTITY>, VIEW extends View<ENTITY>>(viewClass: ConstructorOf<VIEW>,
                                                                                       context: RequestContext<AbstractUser>,
                                                                                       filter?: AbstractFilter): Promise<VIEW> {
        this.checkPermission(viewClass, context);
        const viewDefinition: ViewDefinition<ENTITY> = ViewInitializerService.getViewDefinition(viewClass.name);
        const data: DataObject<ENTITY>[] = await DataService.findAllRaw(viewDefinition.entity, {
            ...FilterService.toSequelize(filter, viewDefinition.entity),
            transaction: context.transaction,
        });
        if (data.length === 0) {
            return null;
        } else if (data.length !== 1) {
            throw new Error(); // TODO
        } else {
            return this.viewHelperService.wrap(data[0], viewDefinition) as VIEW;
        }
    }

    public async findById<ENTITY extends DataObject<ENTITY>, VIEW extends View<ENTITY>>(viewClass: ConstructorOf<VIEW>,
                                                                                        objectId: uuid,
                                                                                        context: RequestContext<AbstractUser>): Promise<VIEW | undefined> {
        this.checkPermission(viewClass, context);
        const viewDefinition: ViewDefinition<ENTITY> = ViewInitializerService.getViewDefinition(viewClass.name);
        const data: DataObject<ENTITY> = await DataService.findById(viewDefinition.entity, objectId, {
            ...this.viewHelperService.getFindOptions(viewDefinition, context),
            transaction: context.transaction,
        });
        if (!data) {
            return undefined;
        }
        return this.viewHelperService.wrap(data, viewDefinition) as VIEW;
    }

    private checkPermission<ENTITY extends DataObject<ENTITY>, VIEW extends View<ENTITY>>(viewClass: ConstructorOf<VIEW>,
                                                                                          context: RequestContext<AbstractUser>): void {
        this.permissionService.checkViewPermission(viewClass, RequestMethod.GET, context);
    }
}
