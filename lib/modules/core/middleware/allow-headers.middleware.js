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
exports.allowHeaders = void 0;
const enemene_1 = require("../application/enemene");
const ALLOWED_ORIGINS = [
    "https://admin.itc-dortmund.de",
    "https://itc-dortmund.de",
    "https://www.itc-dortmund.de",
];
exports.allowHeaders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const allowedOrigins = JSON.parse(JSON.stringify(ALLOWED_ORIGINS));
    if (enemene_1.Enemene.app.devMode) {
        allowedOrigins.push("http://admin.localhost", "https://admin.localhost", "http://localhost:28668", "http://localhost:8090", "http://localhost:8091");
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
});
//# sourceMappingURL=allow-headers.middleware.js.map