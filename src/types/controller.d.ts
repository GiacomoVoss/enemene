import {AbstractUser} from "./auth";
import {serializable} from "./base";
import {Dictionary} from "../base/type/dictionary.type";
import {ActionDefinition} from "../modules/core/action/interface/action-definition.interface";

export declare enum RequestMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE"
}

export declare interface RequestContext<USER extends AbstractUser> {
    [key: string]: serializable;

    currentUser?: USER;
}

export declare abstract class AbstractController {

    protected redirect(url: string): object;

    protected responseWithStatus<DATA>(status: number, data: DATA): object;
}

export interface DataResponse<ENTITY> {
    data: Dictionary<any, keyof ENTITY> | Dictionary<any, keyof ENTITY>[];

    model: Dictionary<serializable>;

    actions?: ActionDefinition[];
}


export declare function Controller(path: string): Function;

export declare function Get(path: string, isPublic?: boolean): Function;

export declare function Post(path: string, isPublic?: boolean): Function;

export declare function Put(path: string, isPublic?: boolean): Function;

export declare function Delete(path: string, isPublic?: boolean): Function;

export declare function Body(key?: string): Function;

export declare function Context(key?: string): Function;

export declare function Header(key: HttpHeader): Function;

export declare function Path(key: string): Function;

export declare function Query(key: string): Function;

export declare function Req(target, propertyKey, parameterIndex: number): void;

export declare enum HttpHeader {
    LANGUAGE = "Accept-Language",
}

