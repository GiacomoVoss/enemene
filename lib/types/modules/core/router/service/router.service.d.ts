import { PathDefinition } from "../../auth/interface/path-definition.interface";
import { Dictionary } from "../../../../base/type/dictionary.type";
import { Response } from "express-serve-static-core";
import { Application, Request } from "express";
import { RequestMethod } from "../enum/request-method.enum";
import { RuntimeError } from "../../interface/runtime-error.interface";
export declare class RouterService {
    static paths: Dictionary<Dictionary<PathDefinition>, RequestMethod>;
    static register(moduleName: string, path: PathDefinition): void;
    private static handler;
    static hasRoute(method: RequestMethod, route: string): boolean;
    static loadPaths(app: Application): void;
    private static resolveParameter;
    /**
     * Middleware used to log an error to the logging stream and return the error in a standard format.
     *
     * @param err   The error.
     * @param req   The current request.
     * @param res   The current response.
     * @param next  Express next function. __NEEDS TO STAY__ even if not used, because express recognizes this function as error handler only if there are all 4 parameters present!
     */
    static logError(err: RuntimeError, req: Request, res: Response, next: Function): Promise<Response<any>>;
}
