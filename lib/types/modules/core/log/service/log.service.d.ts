import * as winston from "winston";
import { Logger } from "winston";
import { ConsoleTransportInstance, StreamTransportInstance } from "winston/lib/winston/transports";
import { LogLevel } from "../enum/log-level.enum";
export declare class LogService {
    static log: Logger;
    static logFormat: winston.Logform.Format;
    static logTransports(path: string): (ConsoleTransportInstance | StreamTransportInstance)[];
    static createLogger(logLevel: LogLevel, path: string): void;
}
