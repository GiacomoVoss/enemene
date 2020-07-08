"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouterService = void 0;
const parameter_type_enum_1 = require("../enum/parameter-type.enum");
const auth_1 = require("../../auth");
const authenticated_guard_1 = require("../../auth/guard/authenticated.guard");
const request_method_enum_1 = require("../enum/request-method.enum");
const log_1 = require("../../log");
class RouterService {
    static register(moduleName, path) {
        let fullPath = `/${moduleName}`;
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
    static handler(req, res, next, pathDefinition) {
        return __awaiter(this, void 0, void 0, function* () {
            const pathFunction = pathDefinition.fn;
            const parameterValues = pathDefinition.parameters.map((param) => this.resolveParameter(req, res, param));
            res.send(yield pathFunction.apply(this, parameterValues));
        });
    }
    static hasRoute(method, route) {
        var _a;
        let routeToSearch = route;
        if (!routeToSearch.startsWith("/")) {
            routeToSearch = `/${routeToSearch}`;
        }
        return Object.keys((_a = this.paths[method]) !== null && _a !== void 0 ? _a : []).includes(routeToSearch);
    }
    static loadPaths(app) {
        let count = 0;
        Object.keys(this.paths).forEach((method) => {
            const paths = Object.keys(this.paths[method]);
            paths.sort((entry1, entry2) => entry2.length - entry1.length);
            paths.forEach((path) => {
                const pathDefinition = this.paths[method][path];
                let handlers = [(req, res, next) => this.handler(req, res, next, pathDefinition)];
                switch (pathDefinition.authorization) {
                    case auth_1.Authorization.ROUTE:
                        handlers = [
                            authenticated_guard_1.authenticatedGuard,
                            (req, res, next) => {
                                auth_1.PermissionService.checkRoutePermission(path, pathDefinition, req.payload);
                                next();
                            },
                            ...handlers,
                        ];
                        break;
                    case auth_1.Authorization.PUBLIC:
                        break;
                }
                switch (pathDefinition.method) {
                    case request_method_enum_1.RequestMethod.GET:
                        app.get(`/api${path}`, ...handlers, this.logError);
                        log_1.LogService.log.debug(`[RouterService] Registering GET     /api${path}`);
                        break;
                    case request_method_enum_1.RequestMethod.POST:
                        app.post(`/api${path}`, ...handlers, this.logError);
                        log_1.LogService.log.debug(`[RouterService] Registering POST    /api${path}`);
                        break;
                    case request_method_enum_1.RequestMethod.PUT:
                        app.put(`/api${path}`, ...handlers, this.logError);
                        log_1.LogService.log.debug(`[RouterService] Registering PUT     /api${path}`);
                        break;
                    case request_method_enum_1.RequestMethod.DELETE:
                        app.delete(`/api${path}`, ...handlers, this.logError);
                        log_1.LogService.log.debug(`[RouterService] Registering DELETE  /api${path}`);
                        break;
                }
                count++;
            });
        });
        log_1.LogService.log.info(`[RouterService] Loaded ${count} paths.`);
    }
    static resolveParameter(req, res, param) {
        const [paramType, value] = param;
        let context;
        switch (paramType) {
            case parameter_type_enum_1.ParameterType.REQUEST:
                return req;
            case parameter_type_enum_1.ParameterType.RESPONSE:
                return res;
            case parameter_type_enum_1.ParameterType.PATH:
                return req.params[value];
            case parameter_type_enum_1.ParameterType.QUERY:
                return req.query[value];
            case parameter_type_enum_1.ParameterType.BODY:
                if (value) {
                    return req.body[value];
                }
                return req.body;
            case parameter_type_enum_1.ParameterType.CURRENT_USER:
                return req.payload;
            case parameter_type_enum_1.ParameterType.CONTEXT:
                context = req.query["context"] ? JSON.parse(req.query["context"]) : {};
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
    static logError(err, req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const statusCode = err.statusCode || 500;
            if ([400, 401, 403, 404].includes(statusCode)) {
                log_1.LogService.log.info(err.message);
            }
            else {
                log_1.LogService.log.error(err);
            }
            return res.status(statusCode).send({
                type: err.type,
                statusCode: statusCode,
                message: err.message,
            });
        });
    }
}
exports.RouterService = RouterService;
RouterService.paths = {
    [request_method_enum_1.RequestMethod.GET]: {},
    [request_method_enum_1.RequestMethod.PUT]: {},
    [request_method_enum_1.RequestMethod.POST]: {},
    [request_method_enum_1.RequestMethod.DELETE]: {},
};
//# sourceMappingURL=router.service.js.map