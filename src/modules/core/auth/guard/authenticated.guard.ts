import {NextFunction, Response} from "express";
import {AuthService} from "../service/auth.service";
import {AbstractUser} from "..";
import {SecureRequest} from "../interface/secure-request.interface";

export const authenticatedGuard = async (req: SecureRequest, res: Response, next: NextFunction) => {

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
