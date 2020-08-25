import {NextFunction, Request, Response} from "express";
import {Enemene} from "../application/enemene";

const ALLOWED_ORIGINS = [];

export const allowHeaders = async (req: Request, res: Response, next: NextFunction) => {
    const allowedOrigins: string[] = JSON.parse(JSON.stringify(ALLOWED_ORIGINS));
    if (Enemene.app.devMode) {
        allowedOrigins.push(
            "http://admin.localhost",
            "https://admin.localhost",
            "http://localhost:28668",
            "http://localhost:8090",
            "http://localhost:8091",
        );
    }

    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Authorization, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method," +
        " Access-Control-Request-Headers");
    const origin = req.get("origin");
    if (allowedOrigins.indexOf(origin) > -1) {
        res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    next();
};
