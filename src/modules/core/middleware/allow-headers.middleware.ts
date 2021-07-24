import {NextFunction, Request, Response} from "express";
import {Enemene} from "../application/enemene";

export const allowHeaders = async (req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Authorization, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method," +
        " Access-Control-Request-Headers");

    if (Enemene.app.config.cors) {
        const allowedOrigins: string[] = JSON.parse(JSON.stringify(Enemene.app.config.allowedOrigins ?? []));
        const origin = req.get("origin");
        if (allowedOrigins.indexOf(origin) > -1) {
            res.header("Access-Control-Allow-Origin", origin);
        }
    } else {
        if (!Enemene.app.devMode) {
            Enemene.log.warn("[Server]", "CORS policies are deactivated. It is highly recommended to enable CORS to prevent cross side scripting attacks.");
        }
        res.header("Access-Control-Allow-Origin", "*");
    }

    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    next();
};
