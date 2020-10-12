import {RequestMethod} from "../../router/enum/request-method.enum";
import {ConstructorOf} from "../../../../base/constructor-of";
import {AbstractController} from "../../router/class/abstract-controller.class";

export interface PathDefinition {
    method: RequestMethod;

    path: string;

    fn: () => any;

    parameters: string[][];

    isPublic: boolean;

    controller?: ConstructorOf<AbstractController>;
}
