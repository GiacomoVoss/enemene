import {RequestContext} from "../interface/request-context.interface";
import {AbstractUser} from "../../auth";
import {serializable} from "../../../../base/type/serializable.type";
import {ConstructorOf} from "../../../../enemene";
import {Transaction} from "sequelize/types/lib/transaction";
import {Sequelize} from "sequelize";
import chalk from "chalk";

export class UnrestrictedRequestContext implements RequestContext<AbstractUser> {

    static $userModel: ConstructorOf<AbstractUser>;
    static $db: Sequelize;

    [key: string]: serializable;

    public currentUser: AbstractUser;
    public language: string = "en";
    public transaction: Transaction;

    constructor(internal?: boolean) {
        if (!internal) {
            throw new Error(`Cannot create UnrestrictedRequestContext directly. Please use ${chalk.bold("UnrestrictedRequestContext.create()")}`);
        }
    }

    public static async create<T extends any>(callback: (UNRESTRICTED: RequestContext<AbstractUser>) => Promise<T>): Promise<T> {
        const context: UnrestrictedRequestContext = new UnrestrictedRequestContext(true);
        context.currentUser = new UnrestrictedRequestContext.$userModel({
            username: "UNRESTRICTED",
        });
        context.transaction = await UnrestrictedRequestContext.$db.transaction();
        const result: T = await callback(context);
        await context.commit();
        return result;
    }

    public async commit(): Promise<void> {
        this.currentUser = undefined;
        await this.transaction.commit();
    }
}