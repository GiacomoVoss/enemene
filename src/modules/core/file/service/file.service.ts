import * as fs from "fs";
import * as path from "path";

export class FileService {

    public static DATA_PATH: string;

    /**
     * Copies a file from one destination path to the other.
     * @param from      Source path.
     * @param to        Destination path.
     */
    public copyFile(from: string, to: string) {
        let source = fs.createReadStream(from);
        let dest = fs.createWriteStream(to);

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
    public deleteFile(filePath): void {
        fs.unlinkSync(filePath);
    }

    /**
     * Splits a full file name in file name and extension.
     *
     * @param fileName  The filename to split.
     */
    public splitFileName(fileName: string): [string, string] {
        const fileNameArr: string[] = fileName.split(".");
        const extension: string = fileNameArr.pop();
        const name: string = fileNameArr.join(".");
        return [name, extension];
    }

    /**
     * Returns paths to all files with the given file name pattern.
     *
     * @param dir       Directory to search in.
     * @param pattern   File pattern to look for.
     */
    public scanForFilePattern(dir: string, pattern: RegExp): string[] {
        return fs.readdirSync(dir).map(file => {
            const fullPath: string = path.join(dir, file);
            if (fs.lstatSync(fullPath).isDirectory()) {
                return this.scanForFilePattern(fullPath, pattern);
            } else {
                if (file.match(pattern)) {
                    return [fullPath];
                } else {
                    return null;
                }
            }
        })
            .filter(file => file !== null && file !== [])
            .reduce((p, c) => p.concat(...c), []);
    }
}
