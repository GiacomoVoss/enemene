import { ISecureRequest } from "@overnightjs/jwt";
import { PathDefinition } from "../../auth/interface/path-definition.interface";
import { DataResponse } from "../../data/interface/data-response.interface";
export declare type PathRequestHandlerFunction<ENTITY> = (req: ISecureRequest, path: PathDefinition) => Promise<DataResponse<ENTITY> | ENTITY>;
