import {PathDefinition} from "../../auth/interface/path-definition.interface";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {Response} from "express-serve-static-core";
import {ParameterType} from "../enum/parameter-type.enum";
import * as express from "express";
import {Application, NextFunction} from "express";
import {AbstractUser} from "../../auth";
import {authenticatedGuard} from "../../auth/guard/authenticated.guard";
import {RequestMethod} from "../enum/request-method.enum";
import {RuntimeError} from "../../application/error/runtime.error";
import {SecureRequest} from "../../auth/interface/secure-request.interface";
import {PermissionService} from "../../auth/service/permission.service";
import {Enemene} from "../../../..";
import {InputValidationError} from "../../validation/error/input-validation.error";
import {Redirect} from "../class/redirect.class";

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
        const result: any | Redirect = await pathFunction.apply(this, parameterValues);
        if (result instanceof Redirect) {
            res.redirect(result.url);
        } else {
            res.send(result);
        }
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
                let handlers: express.RequestHandler[] = [
                    authenticatedGuard,
                    (req: SecureRequest, res: Response, next: NextFunction) => {
                        PermissionService.checkRoutePermission(path, pathDefinition, req.payload);
                        next();
                    },
                    (req, res, next) => this.handler(req as SecureRequest, res, next, pathDefinition),
                ];
                switch (pathDefinition.method) {
                    case RequestMethod.GET:
                        app.get(`/api${path}`, ...handlers, this.logError);
                        break;
                    case RequestMethod.POST:
                        app.post(`/api${path}`, ...handlers, this.logError);
                        break;
                    case RequestMethod.PUT:
                        app.put(`/api${path}`, ...handlers, this.logError);
                        break;
                    case RequestMethod.DELETE:
                        app.delete(`/api${path}`, ...handlers, this.logError);
                        break;
                }
                Enemene.log.debug(this.name, `Registering ${pathDefinition.method.padEnd(7)} /api${path}` + (pathDefinition.isPublic ? " (PUBLIC)" : ""));
                count++;
            });
        });
        Enemene.log.info(this.name, `Registered ${count} paths.`);
    }

    private static resolveParameter(req: SecureRequest, res: Response, param: string[]): any {
        const [paramType, value] = param;
        let context: Dictionary<string>;
        let parameterValue: any = undefined;
        let optional: boolean = false;
        switch (paramType) {
            case ParameterType.REQUEST:
                parameterValue = req;
                break;
            case ParameterType.RESPONSE:
                parameterValue = res;
                break;
            case ParameterType.PATH:
                parameterValue = req.params[value];
                break;
            case ParameterType.QUERY:
                parameterValue = req.query[value] as string;
                optional = true;
                break;
            case ParameterType.BODY:
                if (value) {
                    parameterValue = req.body[value];
                } else {
                    parameterValue = req.body;
                }
                break;
            case ParameterType.CURRENT_USER:
                parameterValue = req.payload as AbstractUser;
                optional = true;
                break;
            case ParameterType.CONTEXT:
                context = req.query["context"] ? JSON.parse(req.query["context"] as string) : {};
                if (value) {
                    parameterValue = context[value];
                } else {
                    parameterValue = context;
                }
                break;
            case ParameterType.HEADER:
                parameterValue = req.header(value);
        }
        if (parameterValue === undefined && !optional) {
            throw new InputValidationError([{
                type: "field",
                field: `${paramType}.${value}`,
                message: "required",
            }]);
        }

        return parameterValue;
    }

    /**
     * Middleware used to log an error to the logging stream and return the error in a standard format.
     *
     * @param err   The error.
     * @param req   The current request.
     * @param res   The current response.
     * @param next  Express next function. __NEEDS TO STAY__ even if not used, because express recognizes this function as error handler only if there are all 4 parameters present!
     */
    public static async logError(err: RuntimeError, req: SecureRequest, res: Response, next: Function) {

        const statusCode = err.statusCode || 500;

        if ([400, 401, 403, 404].includes(statusCode)) {
            Enemene.log.info("Access", `${req.payload ? "(" + req.payload.username + ") " : ""}${err.message}`);
        } else {
            Enemene.log.error("Access", `${req.payload ? "(" + req.payload.username + ") " : ""}${err.message}`);
            Enemene.log.error("Access", err.stack);
        }
        if (err.toJSON) {
            return res.status(statusCode).send(err.toJSON());
        } else {
            return res.status(statusCode).send(new RuntimeError(err.message).toJSON());
        }

    }
}
