import {Enemene} from "../../application";
import {AbstractUserReadModel} from "../interface/abstract-user-read-model.interface";
import {ConstructorOf} from "../../../../base/constructor-of";
import {AuthService} from "./auth.service";
import {ReadModelRepositoryService} from "../../cqrs";

const fs = require("fs");

export class AuthCqrsService {

    private readModelRepository: ReadModelRepositoryService = Enemene.app.inject(ReadModelRepositoryService);

    public PRIVATE_KEY: string;
    public PUBLIC_KEY: string;
    public INCLUDE_IN_TOKEN: string[] = [];

    public initCqrs(publicKeyPath: string, privateKeyPath: string, userModel?: ConstructorOf<AbstractUserReadModel>): void {
        this.PUBLIC_KEY = fs.readFileSync(publicKeyPath, "utf8");
        this.PRIVATE_KEY = fs.readFileSync(privateKeyPath, "utf8");
        if (userModel) {
            const dummyUser = new userModel("dummy", false);
            this.INCLUDE_IN_TOKEN = dummyUser.$includeInToken;
        }
    }

    public createPopulatorUserToken(): string {
        const user: AbstractUserReadModel = new (Enemene.app.config.userModel)() as AbstractUserReadModel;
        user.id = "20eb1e99-3e2a-4e2c-b5ea-4ea2b3674bd2";
        user.username = "populator";
        user.roleId = "populator";
        return AuthService.createToken(user, true);
    }

    public findUser(username: string): AbstractUserReadModel | null {
        return this.readModelRepository.getObjects(Enemene.app.config.userModel as ConstructorOf<AbstractUserReadModel>)
            .find(user => user.username === username && user.active);
    }
}
