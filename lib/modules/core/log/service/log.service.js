"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogService = void 0;
const winston = __importStar(require("winston"));
const file_service_1 = require("../../file/service/file.service");
require("winston-daily-rotate-file");
class LogService {
    static logTransports(path) {
        return [
            new winston.transports.Console(),
            new (winston.transports.DailyRotateFile)({
                dirname: path,
                filename: "enemene.%DATE%.log",
                datePattern: "YYYY-MM-DD"
            })
        ];
    }
    static createLogger(logLevel, path) {
        file_service_1.FileService.mkdirIfMissing(path);
        this.log = winston.createLogger({
            level: logLevel.toLowerCase(),
            transports: this.logTransports(path),
            format: this.logFormat
        });
    }
}
exports.LogService = LogService;
LogService.logFormat = winston.format.combine(winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss"
}), winston.format.printf(({ level, message, label, timestamp }) => {
    const levelPadded = (level.toUpperCase() + ":         ").substr(0, 6);
    return `[${timestamp}${label ? ": " + label : ""}] ${levelPadded} ${message}`;
}));
//# sourceMappingURL=log.service.js.map