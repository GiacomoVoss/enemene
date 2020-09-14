import * as winston from "winston";
import {Logger} from "winston";
import {ConsoleTransportInstance, StreamTransportInstance} from "winston/lib/winston/transports";
import {LogLevel} from "../enum/log-level.enum";
import chalk from "chalk";
import mkdirp from "mkdirp";

require("winston-daily-rotate-file");

export class LogService {

    public log: Logger;

    constructor(logLevel: LogLevel, logsPath: string) {
        mkdirp.sync(logsPath);
        this.log = winston.createLogger({
            level: logLevel.toLowerCase(),
            transports: LogService.logTransports(logsPath),
            format: LogService.logFormat
        });
    }

    public debug(component: string, message: any): void {
        this.logInternal(this.log.debug, component, message);
    }

    public info(component: string, message: any): void {
        this.logInternal(this.log.info, component, message);
    }

    public warn(component: string, message: any): void {
        this.logInternal(this.log.warn, component, message);
    }

    public error(component: string, message: any): void {
        this.logInternal(this.log.error, component, message);
    }

    private static padRight: number = 30;

    private static logFormat = winston.format.combine(
        winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss"
        }),
        winston.format.printf(({level, message, label, timestamp}) => {
            const levelPadded = level.toUpperCase().padEnd(6);
            const text: string = `${timestamp}${label ? ": " + label : ""} ${levelPadded}| ${message}`;
            switch (level.toLowerCase()) {
                case LogLevel.WARN:
                    return chalk.yellow(text);
                case LogLevel.ERROR:
                    return chalk.red(text);
                case LogLevel.INFO:
                    return chalk.green(text);
                default:
                    return chalk.grey(text);
            }
        })
    );

    private static logTransports(path: string): (ConsoleTransportInstance | StreamTransportInstance)[] {
        return [
            new winston.transports.Console(),
            new ((<any>winston.transports).DailyRotateFile)({
                dirname: path,
                filename: "enemene.%DATE%.log",
                datePattern: "YYYY-MM-DD"
            })
        ];
    }

    private logInternal(method: Function, component: string, message: string): void {
        method(`[${component}]`.padEnd(LogService.padRight) + message);
    }
}
