import { NextFunction, Response } from "express";
import { ISecureRequest } from "@overnightjs/jwt";
export declare const authenticatedGuard: (req: ISecureRequest, res: Response, next: NextFunction) => Promise<void>;
