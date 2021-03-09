import path from "path";
import fs from "fs";
import {FileService} from "./file.service";
import mkdirp from "mkdirp";
import {Enemene} from "../../application/enemene";
import {Magic, MAGIC_MIME_TYPE} from "mmmagic";
import {uuid} from "../../../../base/type/uuid.type";
import {UuidService} from "../../service/uuid.service";
import https from "https";

export class DataFileService {

    private mimeDetector: Magic = new Magic(MAGIC_MIME_TYPE);

    /**
     * Downloads the file in the given url and saves it as the given file name.
     * @param url
     * @param fileName
     */
    public async downloadAndSave(url: string, fileName: uuid = UuidService.getUuid()): Promise<uuid | undefined> {
        if (url && url.length) {
            const filePath: string = this.getIndexedFilePath(fileName, true);
            const filePathTokens: string[] = filePath.split(path.sep);
            filePathTokens.pop();
            const dir: string = filePathTokens.join(path.sep);
            if (!fs.existsSync(dir)) {
                await mkdirp(dir);
            }

            const destination = fs.createWriteStream(filePath);
            return new Promise((resolve, reject) => {
                https.get(url, res => {
                    res.pipe(destination);
                    destination.on("finish", () => {
                        destination.close();
                        if (!destination.bytesWritten) {
                            reject("No bytes written.");
                            return;
                        }
                        Enemene.log.debug(this.constructor.name, `Saved ${filePath} (${fs.statSync(filePath).size} bytes)`);
                        resolve(fileName);
                        return;
                    });
                });
            });
        }
    }

    /**
     * Returns the file with the given file name.
     * @param fileName
     */
    public get(fileName: string): Buffer {
        return fs.readFileSync(this.getIndexedFilePath(fileName, true));
    }

    /**
     * Returns if the file with the given file name exists.
     * @param fileName
     */
    public fileExists(fileName: string): boolean {
        return fs.existsSync(this.getIndexedFilePath(fileName, true));
    }

    public async getMimeType(fileName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.mimeDetector.detectFile(this.getIndexedFilePath(fileName, true), (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(result as string);
            });
        });
    }

    public getIndexedFilePath(fileName: string, fullPath: boolean = false): string {
        const indexedPath: string = path.join(
            fileName.substr(0, 2),
            fileName.substr(2, 2),
            fileName.substr(4, 2),
            fileName
        );
        if (fullPath) {
            return path.join(FileService.DATA_PATH, indexedPath);
        } else {
            return indexedPath;
        }
    }
}