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
import {AbstractUser, DataFileService, Enemene} from "../../../..";
import {InputValidationError} from "../../validation/error/input-validation.error";
import {Redirect} from "../class/redirect.class";
import {ConstructorOf} from "../../../../base/constructor-of";
import {AbstractController} from "../class/abstract-controller.class";
import {CustomResponse} from "../class/custom-response.class";
import {IntegrityViolationError} from "../../error/integrity-violation.error";
import {FileService} from "../../file/service/file.service";
import multer from "multer";
import {ValidationFieldError} from "../../validation/interface/validation-field-error.interface";
import {HttpHeader} from "../decorator/parameter/header.decorator";
import {Transaction} from "sequelize/types/lib/transaction";
import {PopulatorController} from "../../dev/dev.controller";
import path from "path";
import {RequestContext} from "../interface/request-context.interface";
import * as fs from "fs";
import {FileResponse} from "../class/file-response.class";

export class RouterService {

    private fileService: FileService = Enemene.app.inject(FileService);
    private dataFileService: DataFileService = Enemene.app.inject(DataFileService);

    public paths: Dictionary<Dictionary<PathDefinition>, RequestMethod> = {};

    private controllers: Dictionary<any> = {};

    private permissionService: PermissionService = Enemene.app.inject(PermissionService);

    private multer;

    async init(systemControllers: ConstructorOf<AbstractController>[]): Promise<void> {
        this.multer = multer({dest: path.join(process.cwd(), "tmpfiles")});
        const controllerFiles: string[] = this.fileService.scanForFilePattern(Enemene.app.config.modulesPath, /.*\.controller\.js/);
        const controllerModules: Dictionary<ConstructorOf<AbstractController>>[] = await Promise.all(controllerFiles.map((filePath: string) => import(filePath)));
        controllerModules.forEach((moduleMap: Dictionary<ConstructorOf<AbstractController>>) => {
            Object.values(moduleMap).forEach((module: ConstructorOf<AbstractController>) => {
                (module.prototype?.$paths || []).forEach((pathDefinition: PathDefinition) => {
                    this.register(module, pathDefinition);
                });
            });
        });

        if (Enemene.app.devMode) {
            systemControllers.push(PopulatorController);
        }

        systemControllers.forEach((module: ConstructorOf<AbstractController>) => {
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

        if (!this.paths[pathDefinition.method]) {
            this.paths[pathDefinition.method] = {};
        }

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

        if (["SequelizeUniqueConstraintError", "SequelizeForeignKeyConstraintError"].includes(err.name)) {
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
        let transaction: Transaction | undefined = undefined;
        if (![RequestMethod.GET].includes(pathDefinition.method)) {
            transaction = await Enemene.app.db.transaction();
        }
        const parameterValues: any[] = pathDefinition.parameters.map((param: string[]) => this.resolveParameter(req, res, param, transaction));
        if (!this.controllers[pathDefinition.controller.name]) {
            Enemene.log.debug(this.constructor.name, `Instantiating ${pathDefinition.controller.name}.`);
            this.controllers[pathDefinition.controller.name] = new pathDefinition.controller();
        }

        try {
            const result: any | Redirect | CustomResponse<any> = await pathDefinition.fn.apply(this.controllers[pathDefinition.controller.name], parameterValues);
            await transaction?.commit();
            if (result instanceof Redirect) {
                res.redirect(result.url);
            } else if (result instanceof CustomResponse) {
                res.status(result.status).send(result.data);
            } else if (result instanceof FileResponse) {
                if (fs.existsSync(result.filePath)) {
                    res.setHeader("Content-Type", await this.dataFileService.getMimeType(result.filePath));
                    res.download(result.filePath, result.fileName);
                } else {
                    res.status(404).end();
                }
            } else {
                res.send(result);
            }
        } catch (e) {
            try {
                await transaction?.rollback();
            } catch (e) {

            }
            throw e;
        }
    }

    private resolveParameter(req: SecureRequest, res: Response, param: string[], transaction?: Transaction): any {
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
                optional = true;
                break;
            case ParameterType.CONTEXT:
                context = req.query["context"] ? JSON.parse(req.query["context"] as string) : {};
                parameterValue = {
                    ...context,
                    currentUser: req.payload,
                    language: req.header(HttpHeader.LANGUAGE),
                    transaction,
                } as RequestContext<AbstractUser>;
                break;
            case ParameterType.HEADER:
                parameterValue = req.header(value);
        }
        if (parameterValue === undefined && !optional) {
            throw new InputValidationError([new ValidationFieldError(`${paramType}.${value}`, "required")], "Request", req.header(HttpHeader.LANGUAGE));
        }

        return parameterValue;
    }
}
