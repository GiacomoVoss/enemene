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
exports.FileService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const log_service_1 = require("../../log/service/log.service");
class FileService {
    /**
     * Copies a file from one destination path to the other.
     * @param from      Source path.
     * @param to        Destination path.
     * @param exact     The given paths are exact and don't need to be prefixed.
     */
    static copyFile(from, to, exact = false) {
        let source;
        let dest;
        if (exact) {
            source = fs.createReadStream(from);
            dest = fs.createWriteStream(to);
        }
        else {
            source = fs.createReadStream(from);
            dest = fs.createWriteStream(to);
        }
        return new Promise((resolve, reject) => {
            source.on("end", resolve);
            source.on("error", reject);
            source.pipe(dest);
        });
    }
    /**
     * Delets a file at the given path.
     * @param filePath
     */
    static deleteFile(filePath) {
        fs.unlinkSync(filePath);
    }
    /**
     * Checks if a given file exists.
     * @param filePath
     * @return boolean if the file exists.
     */
    static fileExists(filePath) {
        return fs.existsSync(filePath);
    }
    /**
     * Recursively creates a folder and all the folders along the way, if it doesn't exist.
     *
     * @param dir   Path to the folder.
     */
    static mkdirIfMissing(dir) {
        const folders = dir.split(path.sep);
        folders.reduce((prev, act) => {
            const _path = path.join(prev, act);
            if (act == "." || act == "..") {
                return _path;
            }
            if (!fs.existsSync(_path)) {
                if (log_service_1.LogService.log) {
                    log_service_1.LogService.log.info("Creating missing folder: " + _path);
                }
                fs.mkdirSync(_path);
            }
            return _path;
        }, dir.substr(0, 1) === path.sep ? path.sep : "");
    }
    /**
     * Splits a full file name in file name and extension.
     *
     * @param fileName  The filename to split.
     */
    static splitFileName(fileName) {
        const fileNameArr = fileName.split(".");
        const extension = fileNameArr.pop();
        const name = fileNameArr.join(".");
        return [name, extension];
    }
    /**
     * Returns paths to all files with the given file name pattern.
     *
     * @param dir       Directory to search in.
     * @param pattern   File pattern to look for.
     */
    static scanForFilePattern(dir, pattern) {
        return fs.readdirSync(dir).map(file => {
            const fullPath = path.join(dir, file);
            if (fs.lstatSync(fullPath).isDirectory()) {
                return FileService.scanForFilePattern(fullPath, pattern);
            }
            else {
                if (file.match(pattern)) {
                    return [fullPath];
                }
                else {
                    return null;
                }
            }
        })
            .filter(file => file !== null && file !== [])
            .reduce((p, c) => p.concat(...c), []);
    }
}
exports.FileService = FileService;
//# sourceMappingURL=file.service.js.map