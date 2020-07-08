import {createTransport} from "nodemailer";
import {LogService} from "../log/service/log.service";
import {Enemene} from "../application/enemene";

const DefaultMailFrom = "webserver@itc-dortmund.de";
const DefaultMailFromName = "IT-Center Dortmund";

const transporter = createTransport({
    host: "smtp-relay.gmail.com",
    port: 25,
    requireTLS: true,
    auth: {
        user: "webserver@itc-dortmund.de",
        pass: "xvgpxcihguzuiyal"
    }
});

const sendMail = async (subject: string, content: string, to: string[], from: string = DefaultMailFrom, fromName: string = DefaultMailFromName): Promise<any> => {
    if (Enemene.app.devMode) {
        LogService.log.debug(`E-Mail from ${fromName} ${"<" + from + ">"}:\n
        Recipient(s): ${to.join(", ")}\n
        Subject: ${subject}\n
        Content: ${subject}\n
        `);
        return Promise.resolve();
    } else {
        return transporter.sendMail({
            subject: subject,
            html: content,
            encoding: "utf-8",
            to: to,
            from: fromName + "<" + from + ">"
        });
    }
};

export const MailService = {
    sendMail
};
