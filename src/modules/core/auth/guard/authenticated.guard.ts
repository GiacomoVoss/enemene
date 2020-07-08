import {NextFunction, Response} from "express";
import {AuthService} from "../service/auth.service";
import {ISecureRequest} from "@overnightjs/jwt";
import {AbstractUser} from "..";

export const authenticatedGuard = async (req: ISecureRequest, res: Response, next: NextFunction) => {

    const token: string = req.header("Authorization");
    if (!token) {
        return res.status(401).end("Invalid token");
    }

    var user: AbstractUser;
    try {
        user = await AuthService.authenticate(token);
        if (!user) {
            return res.status(401).end("Invalid token");
        }
    } catch (error) {
        res.status(403).end();
    }

    req.payload = user;
    next();
};
