import * as winston from "winston";
import {Logger} from "winston";
import {ConsoleTransportInstance, StreamTransportInstance} from "winston/lib/winston/transports";
import {FileService} from "../../file/service/file.service";
import {LogLevel} from "../enum/log-level.enum";

require("winston-daily-rotate-file");

export class LogService {

    public static log: Logger;

    public static logFormat = winston.format.combine(
        winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss"
        }),
        winston.format.printf(({level, message, label, timestamp}) => {
            const levelPadded = (level.toUpperCase() + ":         ").substr(0, 6);
            return `[${timestamp}${label ? ": " + label : ""}] ${levelPadded} ${message}`;
        })
    );

    public static logTransports(path: string): (ConsoleTransportInstance | StreamTransportInstance)[] {
        return [
            new winston.transports.Console(),
            new ((<any>winston.transports).DailyRotateFile)({
                dirname: path,
                filename: "enemene.%DATE%.log",
                datePattern: "YYYY-MM-DD"
            })
        ];
    }

    public static createLogger(logLevel: LogLevel, path: string) {
        FileService.mkdirIfMissing(path);
        this.log = winston.createLogger({
            level: logLevel.toLowerCase(),
            transports: this.logTransports(path),
            format: this.logFormat
        });
    }

}
