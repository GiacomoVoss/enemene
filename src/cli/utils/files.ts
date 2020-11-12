import {FileService} from "../../modules/core/file/service/file.service";
import {camelCase, upperFirst} from "lodash";
import {Dictionary} from "../../base/type/dictionary.type";
import view from "../templates/view.template";
import entity from "../templates/entity.template";
import Handlebars from "handlebars";
import * as fs from "fs";
import path from "path";

const templates: Record<string, string> = {view, entity};

export async function getModels(): Promise<Dictionary<string>> {
    const fileService: FileService = new FileService();
    return fileService.scanForFilePattern(path.join(process.cwd(), "src"), /.*\.model\.ts$/).reduce((map: Dictionary<string>, fileName: string) => {
        const modelName: string = getModelNameFromFile(fileName);
        map[modelName] = fileName;
        return map;
    }, {});
}

export function getModelNameFromFile(fileName: string): string {
    return upperFirst(camelCase(fileName.substring(fileName.lastIndexOf("/"), fileName.lastIndexOf(".model"))));
}

export function createFromTemplate(templateName: string, outFile: string, data: any) {
    const source: string = templates[templateName];
    const template = Handlebars.compile(source);
    fs.writeFileSync(outFile, template(data), {});
}
