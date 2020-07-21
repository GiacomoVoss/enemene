import * as fs from "fs";
import * as path from "path";

export class FileService {

    /**
     * Copies a file from one destination path to the other.
     * @param from      Source path.
     * @param to        Destination path.
     * @param exact     The given paths are exact and don't need to be prefixed.
     */
    public static copyFile(from: string, to: string, exact: boolean = false) {
        let source;
        let dest;
        if (exact) {
            source = fs.createReadStream(from);
            dest = fs.createWriteStream(to);
        } else {
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
    public static deleteFile(filePath): void {
        fs.unlinkSync(filePath);
    }

    /**
     * Checks if a given file exists.
     * @param filePath
     * @return boolean if the file exists.
     */
    public static fileExists(filePath: string): boolean {
        return fs.existsSync(filePath);
    }

    /**
     * Splits a full file name in file name and extension.
     *
     * @param fileName  The filename to split.
     */
    public static splitFileName(fileName: string): [string, string] {
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
    public static scanForFilePattern(dir: string, pattern: RegExp): string[] {
        return fs.readdirSync(dir).map(file => {
            const fullPath: string = path.join(dir, file);
            if (fs.lstatSync(fullPath).isDirectory()) {
                return FileService.scanForFilePattern(fullPath, pattern);
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
