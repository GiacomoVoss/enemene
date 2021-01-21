import {PathDefinition} from "../../auth/interface/path-definition.interface";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {Response} from "express-serve-static-core";
import {ParameterType} from "../enum/parameter-type.enum";
import * as express from "express";
import {Application, NextFunction} from "express";
import {authenticatedGuard} from "../../auth/guard/authenticated.guard";
import {RequestMethod} from "../enum/request-method.enum";
import {RuntimeError} from "../../application/error/runtime.error";
import {SecureRequest} from "../../auth/interface/secure-request.interface";
import {PermissionService} from "../../auth/service/permission.service";
import {Enemene, FileController} from "../../../..";
import {InputValidationError} from "../../validation/error/input-validation.error";
import {Redirect} from "../class/redirect.class";
import {ConstructorOf} from "../../../../base/constructor-of";
import {AbstractController} from "../class/abstract-controller.class";
import {CustomResponse} from "../class/custom-response.class";
import {IntegrityViolationError} from "../../error/integrity-violation.error";
import AuthController from "../../auth/auth.controller";
import ActionController from "../../action/action.controller";
import ViewGetController from "../../view/view-get.controller";
import ViewPostController from "../../view/view-post.controller";
import ViewPutController from "../../view/view-put.controller";
import ViewDeleteController from "../../view/view-delete.controller";
import {ModelController} from "../../model/model.controller";
import {FileService} from "../../file/service/file.service";
import multer from "multer";

export class RouterService {

    private fileService: FileService = Enemene.app.inject(FileService);

    public paths: Dictionary<Dictionary<PathDefinition>, RequestMethod> = {
        [RequestMethod.GET]: {},
        [RequestMethod.PUT]: {},
        [RequestMethod.POST]: {},
        [RequestMethod.POSTFILE]: {},
        [RequestMethod.DELETE]: {},
    };

    private controllers: Dictionary<any> = {};

    private permissionService: PermissionService = Enemene.app.inject(PermissionService);

    private multer;

    async init(): Promise<void> {
        this.multer = multer({dest: Enemene.app.config.dataPath});
        const controllerFiles: string[] = this.fileService.scanForFilePattern(Enemene.app.config.modulesPath, /.*\.controller\.js/);
        const controllerModules: Dictionary<ConstructorOf<AbstractController>>[] = await Promise.all(controllerFiles.map((filePath: string) => import(filePath)));
        controllerModules.forEach((moduleMap: Dictionary<ConstructorOf<AbstractController>>) => {
            Object.values(moduleMap).forEach((module: ConstructorOf<AbstractController>) => {
                (module.prototype?.$paths || []).forEach((pathDefinition: PathDefinition) => {
                    this.register(module, pathDefinition);
                });
            });
        });

        [AuthController,
            ActionController,
            FileController,
            ViewGetController,
            ViewPostController,
            ViewPutController,
            ViewDeleteController,
            ModelController,
        ].forEach((module: ConstructorOf<AbstractController>) => {
            (module.prototype.$paths || []).forEach((pathDefinition: PathDefinition) => {
                this.register(module, pathDefinition);
            });
        });
    }

    public static hasRoute(method: RequestMethod, route: string): boolean {
        let routeToSearch: string = route;
        if (!routeToSearch.startsWith("/")) {
            routeToSearch = `/${routeToSearch}`;
        }
        return Object.keys(Enemene.app.inject(RouterService).paths[method] ?? []).includes(routeToSearch);
    }

    public register(router: ConstructorOf<AbstractController>, pathDefinition: PathDefinition): void {
        const moduleName: string = router.prototype.$path;
        let fullPath: string = `/${moduleName}`;
        pathDefinition.controller = router;
        if (pathDefinition.path === "/") {
            this.paths[pathDefinition.method][fullPath] = pathDefinition;
            return;
        }

        if (!pathDefinition.path.startsWith("/")) {
            fullPath += "/";
        }
        fullPath += pathDefinition.path;
        this.paths[pathDefinition.method][fullPath] = pathDefinition;
    }

    public loadPaths(app: Application): void {
        let count: number = 0;
        Object.keys(this.paths).forEach((method: RequestMethod) => {
            const paths: string[] = Object.keys(this.paths[method]);
            paths.sort((entry1: string, entry2: string) => entry2.length - entry1.length);
            paths.forEach((path: string) => {
                const pathDefinition: PathDefinition = this.paths[method][path];
                let handlers: express.RequestHandler[] = [
                    authenticatedGuard,
                    (req: SecureRequest, res: Response, next: NextFunction) => {
                        this.permissionService.checkRoutePermission(path, pathDefinition, req.payload);
                        next();
                    },
                    (req, res, next) => this.handle(req as SecureRequest, res, next, pathDefinition),
                ];
                switch (pathDefinition.method) {
                    case RequestMethod.GET:
                        app.get(`/api${path}`, ...handlers, this.logError);
                        break;
                    case RequestMethod.POST:
                        app.post(`/api${path}`, ...handlers, this.logError);
                        break;
                    case RequestMethod.POSTFILE:
                        app.post(`/api${path}`,
                            authenticatedGuard,
                            this.multer.single("file"),
                            (req: SecureRequest, res: Response, next: NextFunction) => {
                                this.permissionService.checkRoutePermission(path, pathDefinition, req.payload);
                                next();
                            },
                            (req, res, next) => this.handle(req as SecureRequest, res, next, pathDefinition),
                            this.logError
                        );
                        break;
                    case RequestMethod.PUT:
                        app.put(`/api${path}`, ...handlers, this.logError);
                        break;
                    case RequestMethod.DELETE:
                        app.delete(`/api${path}`, ...handlers, this.logError);
                        break;
                }
                Enemene.log.debug(this.constructor.name, `Registering ${pathDefinition.method.padEnd(7)} /api${path}` + (pathDefinition.isPublic ? " (PUBLIC)" : ""));
                count++;
            });
        });
        Enemene.log.info(this.constructor.name, `Registered ${count} paths.`);
    }

    /**
     * Middleware used to log an error to the logging stream and return the error in a standard format.
     *
     * @param err   The error.
     * @param req   The current request.
     * @param res   The current response.
     * @param next  Express next function. __NEEDS TO STAY__ even if not used, because express recognizes this function as error handler only if there are all 4 parameters present!
     */
    public async logError(err: RuntimeError, req: SecureRequest, res: Response, next: Function) {

        if (err.name === "SequelizeForeignKeyConstraintError") {
            err = new IntegrityViolationError();
        }

        const statusCode = err.statusCode || 500;

        if ([400, 401, 403, 404, 423].includes(statusCode)) {
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

    private async handle(req: SecureRequest, res: Response, next: Function, pathDefinition: PathDefinition): Promise<void> {
        const parameterValues: any[] = pathDefinition.parameters.map((param: string[]) => this.resolveParameter(req, res, param));
        if (!this.controllers[pathDefinition.controller.name]) {
            Enemene.log.debug(this.constructor.name, `Instantiating ${pathDefinition.controller.name}.`);
            this.controllers[pathDefinition.controller.name] = new pathDefinition.controller();
        }
        const result: any | Redirect | CustomResponse<any> = await pathDefinition.fn.apply(this.controllers[pathDefinition.controller.name], parameterValues);
        if (result instanceof Redirect) {
            res.redirect(result.url);
        } else if (result instanceof CustomResponse) {
            res.status(result.status).send(result.data);
        } else {
            res.send(result);
        }
    }

    private resolveParameter(req: SecureRequest, res: Response, param: string[]): any {
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
            case ParameterType.CONTEXT:
                context = req.query["context"] ? JSON.parse(req.query["context"] as string) : {};
                if (value) {
                    parameterValue = context[value];
                } else {
                    parameterValue = {
                        ...context,
                        currentUser: req.payload,
                    };
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
}
