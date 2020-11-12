import {Logger} from "winston";

export declare class LogService {

    public log: Logger;

    constructor(logLevel: LogLevel, logsPath: string);

    public trace(component: string, message: any): void;

    public debug(component: string, message: any): void;

    public info(component: string, message: any): void;

    public warn(component: string, message: any): void;

    public error(component: string, message: any): void;
}

export declare enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error",
    TRACE = "trace",
}
