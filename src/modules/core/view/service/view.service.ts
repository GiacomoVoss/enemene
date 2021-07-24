import {DataObject} from "../../model";
import {View} from "../class/view.class";
import {ConstructorOf} from "../../../../base/constructor-of";
import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUser} from "../../auth";
import {AbstractFilter} from "../../filter";
import {ViewFindOptions} from "../interface/view-find-options.interface";
import {ViewFindService} from "./view-find.service";
import {Enemene} from "../../application";
import {ViewSaveService} from "./view-save.service";
import {uuid} from "../../../../base/type/uuid.type";
import {DataService} from "../../data";
import {ObjectNotFoundError} from "../../error";

export class ViewService {

    private viewFindService: ViewFindService = Enemene.app.inject(ViewFindService);
    private viewSaveService: ViewSaveService = Enemene.app.inject(ViewSaveService);

    public async findAll<ENTITY extends DataObject<ENTITY>, VIEW extends View<ENTITY>>(viewClass: ConstructorOf<VIEW>,
                                                                                       context: RequestContext<AbstractUser>,
                                                                                       filter?: AbstractFilter,
                                                                                       options?: ViewFindOptions): Promise<VIEW[]> {
        return this.viewFindService.findAll(viewClass, context, filter, options);
    }


    public async findOne<ENTITY extends DataObject<ENTITY>, VIEW extends View<ENTITY>>(viewClass: ConstructorOf<VIEW>,
                                                                                       context: RequestContext<AbstractUser>,
                                                                                       filter?: AbstractFilter): Promise<VIEW> {
        return this.viewFindService.findOne(viewClass, context, filter);
    }

    public async findById<ENTITY extends DataObject<ENTITY>, VIEW extends View<ENTITY>>(viewClass: ConstructorOf<VIEW>,
                                                                                        objectId: uuid,
                                                                                        context: RequestContext<AbstractUser>): Promise<VIEW | undefined> {
        return this.viewFindService.findById(viewClass, objectId, context);
    }

    public async findNotNullById<ENTITY extends DataObject<ENTITY>, VIEW extends View<ENTITY>>(viewClass: ConstructorOf<VIEW>,
                                                                                               objectId: uuid,
                                                                                               context: RequestContext<AbstractUser>): Promise<VIEW> {
        const result: VIEW | undefined = await this.viewFindService.findById(viewClass, objectId, context);
        if (!result) {
            throw new ObjectNotFoundError(viewClass.name);
        }
        return result;
    }

    public async save<ENTITY extends DataObject<ENTITY>>(view: View<ENTITY>,
                                                         context: RequestContext<AbstractUser>): Promise<View<ENTITY>> {
        return this.viewSaveService.save(view, context);
    }

    public async delete<ENTITY extends DataObject<ENTITY>>(view: View<ENTITY>,
                                                           context: RequestContext<AbstractUser>): Promise<void> {
        const object: DataObject<ENTITY> = await DataService.findById(view.$view.entity, view.id, {
            transaction: context.transaction,
        });
        await DataService.delete(object, context);
    }
}
