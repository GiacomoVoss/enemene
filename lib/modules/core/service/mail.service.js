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
exports.MailService = void 0;
const nodemailer_1 = require("nodemailer");
const log_service_1 = require("../log/service/log.service");
const enemene_1 = require("../application/enemene");
const DefaultMailFrom = "webserver@itc-dortmund.de";
const DefaultMailFromName = "IT-Center Dortmund";
const transporter = nodemailer_1.createTransport({
    host: "smtp-relay.gmail.com",
    port: 25,
    requireTLS: true,
    auth: {
        user: "webserver@itc-dortmund.de",
        pass: "xvgpxcihguzuiyal"
    }
});
const sendMail = (subject, content, to, from = DefaultMailFrom, fromName = DefaultMailFromName) => __awaiter(void 0, void 0, void 0, function* () {
    if (enemene_1.Enemene.app.devMode) {
        log_service_1.LogService.log.debug(`E-Mail from ${fromName} ${"<" + from + ">"}:\n
        Recipient(s): ${to.join(", ")}\n
        Subject: ${subject}\n
        Content: ${subject}\n
        `);
        return Promise.resolve();
    }
    else {
        return transporter.sendMail({
            subject: subject,
            html: content,
            encoding: "utf-8",
            to: to,
            from: fromName + "<" + from + ">"
        });
    }
});
exports.MailService = {
    sendMail
};
//# sourceMappingURL=mail.service.js.map