import {FileService} from "../../file/service/file.service";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {ConstructorOf} from "../../../../base/constructor-of";
import {DataService, Enemene} from "../../../..";
import {uuid} from "../../../../base/type/uuid.type";
import {serializable} from "../../../../base/type/serializable.type";
import {DataImport} from "../model/data-import.model";
import {ImportFieldMapping} from "../model/import-field-mapping.model";
import {ImportReferenceMapping} from "../model/import-reference-mapping.model";
import {AbstractImportDefinition} from "../class/abstract-import-definition.class";
import {ObjectNotFoundError} from "../../error/object-not-found.error";

export class DataImportService {

    private importDefinitionsClasses: Dictionary<ConstructorOf<AbstractImportDefinition<any>>> = {};
    private importDefinitions: Dictionary<AbstractImportDefinition<any>> = {};

    public async onStart(): Promise<void> {
        const serviceFiles: string[] = Enemene.app.inject(FileService).scanForFilePattern(process.cwd(), /.*\.import\.js/);
        const serviceModules: Dictionary<ConstructorOf<AbstractImportDefinition<any>>>[] = await Promise.all(serviceFiles.map((filePath: string) => import(filePath)));
        serviceModules.forEach((moduleMap: Dictionary<ConstructorOf<AbstractImportDefinition<any>>>) => {
            Object.values(moduleMap).forEach((module: ConstructorOf<AbstractImportDefinition<any>>) => {
                Enemene.log.debug(this.constructor.name, "Registering import definition " + name);
                if (module.prototype.onStart) {
                    this.importDefinitionsClasses[name] = module;
                }
            });
        });
    }

    public getImportDefinition(name: string): AbstractImportDefinition<any> {
        if (!this.importDefinitionsClasses[name]) {
            throw new ObjectNotFoundError(name);
        }
        if (!this.importDefinitions[name]) {
            this.importDefinitions[name] = new this.importDefinitionsClasses[name];
        }
        return this.importDefinitions[name];
    }

    public getImportDefinitionsList(): string[] {
        return Object.keys(this.importDefinitionsClasses);
    }

    public async import(dataImportId: uuid, objects: Dictionary<serializable>[]): Promise<void> {
        const dataImport: DataImport = await DataService.findNotNullById(DataImport, dataImportId, {
            include: [
                {model: ImportFieldMapping, as: "fieldMappings"},
                {model: ImportReferenceMapping, as: "referenceMappings"}
            ]
        });
        const importDefinition: AbstractImportDefinition<any> = this.getImportDefinition(dataImport.importDefinition);

        const datasToImport: Dictionary<serializable>[] = importDefinition.filterObjects(objects);
        const total: number = datasToImport.length;
        Enemene.log.info(this.constructor.name, `Importing ${total} objects...`);
        await importDefinition.import(objects);
    }
}
