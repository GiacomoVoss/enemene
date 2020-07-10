import {PathDefinition} from "../../auth/interface/path-definition.interface";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {Response} from "express-serve-static-core";
import {ParameterType} from "../enum/parameter-type.enum";
import * as express from "express";
import {Application, NextFunction, Request} from "express";
import {AbstractUser, Authorization, PermissionService} from "../../auth";
import {authenticatedGuard} from "../../auth/guard/authenticated.guard";
import {RequestMethod} from "../enum/request-method.enum";
import {RuntimeError} from "../../interface/runtime-error.interface";
import {LogService} from "../../log";
import {SecureRequest} from "../../auth/interface/secure-request.interface";

export class RouterService {

    public static paths: Dictionary<Dictionary<PathDefinition>, RequestMethod> = {
        [RequestMethod.GET]: {},
        [RequestMethod.PUT]: {},
        [RequestMethod.POST]: {},
        [RequestMethod.DELETE]: {},
    };

    public static register(moduleName: string, path: PathDefinition): void {
        let fullPath: string = `/${moduleName}`;
        if (path.path === "/") {
            this.paths[path.method][fullPath] = path;
            return;
        }

        if (!path.path.startsWith("/")) {
            fullPath += "/";
        }
        fullPath += path.path;
        this.paths[path.method][fullPath] = path;
    }

    private static async handler(req: SecureRequest, res: Response, next: Function, pathDefinition: PathDefinition): Promise<void> {
        const pathFunction: Function = pathDefinition.fn;
        const parameterValues: any[] = pathDefinition.parameters.map((param: string[]) => this.resolveParameter(req, res, param));
        res.send(await pathFunction.apply(this, parameterValues));
    }

    public static hasRoute(method: RequestMethod, route: string): boolean {
        let routeToSearch: string = route;
        if (!routeToSearch.startsWith("/")) {
            routeToSearch = `/${routeToSearch}`;
        }
        return Object.keys(this.paths[method] ?? []).includes(routeToSearch);
    }

    public static loadPaths(app: Application): void {
        let count: number = 0;
        Object.keys(this.paths).forEach((method: RequestMethod) => {
            const paths: string[] = Object.keys(this.paths[method]);
            paths.sort((entry1: string, entry2: string) => entry2.length - entry1.length);
            paths.forEach((path: string) => {
                const pathDefinition: PathDefinition = this.paths[method][path];
                let handlers: express.RequestHandler[] = [(req, res, next) => this.handler(req as SecureRequest, res, next, pathDefinition)];
                switch (pathDefinition.authorization) {
                    case Authorization.ROUTE:
                        handlers = [
                            authenticatedGuard,
                            (req: SecureRequest, res: Response, next: NextFunction) => {
                                PermissionService.checkRoutePermission(path, pathDefinition, req.payload);
                                next();
                            },
                            ...handlers,
                        ];
                        break;
                    case Authorization.PUBLIC:
                        break;
                }
                switch (pathDefinition.method) {
                    case RequestMethod.GET:
                        app.get(`/api${path}`, ...handlers, this.logError);
                        LogService.log.debug(`[RouterService] Registering GET     /api${path}`);
                        break;
                    case RequestMethod.POST:
                        app.post(`/api${path}`, ...handlers, this.logError);
                        LogService.log.debug(`[RouterService] Registering POST    /api${path}`);
                        break;
                    case RequestMethod.PUT:
                        app.put(`/api${path}`, ...handlers, this.logError);
                        LogService.log.debug(`[RouterService] Registering PUT     /api${path}`);
                        break;
                    case RequestMethod.DELETE:
                        app.delete(`/api${path}`, ...handlers, this.logError);
                        LogService.log.debug(`[RouterService] Registering DELETE  /api${path}`);
                        break;
                }
                count++;
            });
        });
        LogService.log.info(`[RouterService] Loaded ${count} paths.`);
    }

    private static resolveParameter(req: SecureRequest, res: Response, param: string[]): any {
        const [paramType, value] = param;
        let context: Dictionary<string>;
        switch (paramType) {
            case ParameterType.REQUEST:
                return req;
            case ParameterType.RESPONSE:
                return res;
            case ParameterType.PATH:
                return req.params[value];
            case ParameterType.QUERY:
                return req.query[value] as string;
            case ParameterType.BODY:
                if (value) {
                    return req.body[value];
                }
                return req.body;
            case ParameterType.CURRENT_USER:
                return req.payload as AbstractUser;
            case ParameterType.CONTEXT:
                context = req.query["context"] ? JSON.parse(req.query["context"] as string) : {};
                if (value) {
                    return context[value];
                }
                return context;
        }
    }

    /**
     * Middleware used to log an error to the logging stream and return the error in a standard format.
     *
     * @param err   The error.
     * @param req   The current request.
     * @param res   The current response.
     * @param next  Express next function. __NEEDS TO STAY__ even if not used, because express recognizes this function as error handler only if there are all 4 parameters present!
     */
    public static async logError(err: RuntimeError, req: Request, res: Response, next: Function) {

        const statusCode = err.statusCode || 500;

        if ([400, 401, 403, 404].includes(statusCode)) {
            LogService.log.info(err.message);
        } else {
            LogService.log.error(err);
        }

        return res.status(statusCode).send({
            type: err.type,
            statusCode: statusCode,
            message: err.message,
        });
    }
}
