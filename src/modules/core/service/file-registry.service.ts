import {ConstructorOf} from "../../../base/constructor-of";
import {Enemene} from "../application";
import {Dictionary} from "../../../base/type/dictionary.type";
import {FileService} from "../file/service/file.service";

export abstract class FileRegistryService {

    private fileService: FileService = Enemene.app.inject(FileService);

    async loadFiles<CLASS>(filePattern: RegExp, systemModules: Dictionary<any> = {}): Promise<ConstructorOf<CLASS>[]> {
        const files: string[] = this.fileService.scanForFilePattern(Enemene.app.config.modulesPath, filePattern);
        const modules: Dictionary<ConstructorOf<CLASS>>[] = await Promise.all(files.map((filePath: string) => import(filePath)));

        return [systemModules, ...modules].reduce((result: ConstructorOf<CLASS>[], moduleMap: Dictionary<ConstructorOf<CLASS>>) => {
            return [...result, ...Object.values(moduleMap)];
        }, []) as ConstructorOf<CLASS>[];
    }
}