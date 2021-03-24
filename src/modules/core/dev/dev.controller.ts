import {AbstractController, Context, Controller, Post} from "../router";
import {RequestContext} from "../router/interface/request-context.interface";
import {AbstractUser, ForbiddenError} from "../auth";
import {Enemene} from "../application";
import {Sequelize} from "sequelize";
import {ModelService} from "../model/service/model.service";

@Controller("dev")
export class PopulatorController extends AbstractController {

    private modelService: ModelService = Enemene.app.inject(ModelService);

    @Post("reinit-db", true)
    public async clearDatabase(@Context context: RequestContext<AbstractUser>) {
        if (!context.currentUser.isPopulator) {
            throw new ForbiddenError();
        }

        const db: Sequelize = Enemene.app.db;
        const database: string = Enemene.app.config.db.database;

        await db.query(`DROP DATABASE IF EXISTS \`${database}\``);
        await db.query(`CREATE DATABASE \`${database}\` CHARACTER SET = utf8 COLLATE = utf8_general_ci`);
        await db.query(`USE \`${database}\``);
        await db.sync({
            logging: (sql: string) => Enemene.log.debug(this.constructor.name, sql),
        });

        await this.modelService.init(Enemene.app, Enemene.systemModels);
    }
}