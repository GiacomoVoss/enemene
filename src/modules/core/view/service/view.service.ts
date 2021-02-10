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
import {Transaction} from "sequelize/types/lib/transaction";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {UuidService} from "../../service/uuid.service";
import {UnsupportedOperationError} from "../../error";

export class ViewService {

    private transactions: Dictionary<Transaction> = {};

    private viewFindService: ViewFindService = Enemene.app.inject(ViewFindService);
    private viewSaveService: ViewSaveService = Enemene.app.inject(ViewSaveService);

    public async startTransaction(): Promise<uuid> {
        const id: uuid = UuidService.getUuid();
        this.transactions[id] = await Enemene.app.db.transaction();
        return id;
    }

    public async commitTransaction(id: uuid): Promise<void> {
        await this.getTransaction(id).commit();
    }

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

    public async save<ENTITY extends DataObject<ENTITY>>(view: View<ENTITY>,
                                                         context: RequestContext<AbstractUser>,
                                                         transactionId?: uuid): Promise<View<ENTITY>> {
        return this.viewSaveService.save(view, context, transactionId ? this.getTransaction(transactionId) : undefined);
    }

    public async delete<ENTITY extends DataObject<ENTITY>>(view: View<ENTITY>,
                                                           context: RequestContext<AbstractUser>): Promise<void> {
        await DataService.delete(new DataObject<ENTITY>({id: view.id}), context);
    }

    private getTransaction(id: uuid): Transaction {
        const t: Transaction | undefined = this.transactions[id];
        if (!t) {
            throw new UnsupportedOperationError(`No transaction found with id ${id}.`);
        }
        return t;
    }
}