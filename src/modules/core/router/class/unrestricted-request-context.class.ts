import {RequestContext} from "../interface/request-context.interface";
import {AbstractUser} from "../../auth";
import {serializable} from "../../../../base/type/serializable.type";
import {ConstructorOf} from "../../../../enemene";

export class UnrestrictedRequestContext implements RequestContext<AbstractUser> {

    static $userModel: ConstructorOf<AbstractUser>;

    [key: string]: serializable;

    public currentUser: AbstractUser;
    public language: string = "en";

    constructor() {
        this.currentUser = new UnrestrictedRequestContext.$userModel({
            username: "UNRESTRICTED",
        });
    }

    public destroy(): void {
        this.currentUser = undefined;
    }
}