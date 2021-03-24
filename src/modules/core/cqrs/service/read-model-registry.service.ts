import {Enemene, EnemeneCqrs} from "../../application";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {ConstructorOf} from "../../../../base/constructor-of";
import {FileService} from "../../file/service/file.service";
import {ReadModel} from "../class/read-model.class";
import {EventHandlerDefinition} from "../interface/event-handler-definition.interface";
import chalk from "chalk";
import {ObjectNotFoundError} from "../../error";

export class ReadModelRegistryService {

    private readModelClasses: Dictionary<ConstructorOf<ReadModel>> = {};
    private endpointToReadModelMap: Dictionary<ConstructorOf<ReadModel>> = {};
    private eventToReadModelMap: Dictionary<string[]> = {};

    private fileService: FileService = Enemene.app.inject(FileService);

    async init(): Promise<void> {
        const readModelFiles: string[] = this.fileService.scanForFilePattern(Enemene.app.config.modulesPath, /.*\.read-model\.js/);
        const readModelModules: Dictionary<ConstructorOf<ReadModel>>[] = await Promise.all(readModelFiles.map((filePath: string) => import(filePath)));

        const systemModules = await import("../read-model");

        [systemModules, ...readModelModules].forEach((moduleMap: Dictionary<ConstructorOf<ReadModel>>) => {
            Object.values(moduleMap).forEach((readModel: ConstructorOf<ReadModel>) => {
                EnemeneCqrs.log.debug(this.constructor.name, `Registering read model ${chalk.bold(readModel.name)}`);
                this.readModelClasses[readModel.name] = readModel;
                const endpoint: string | undefined = (new readModel()).$endpoint;
                if (endpoint) {
                    this.endpointToReadModelMap[endpoint] = readModel;
                    Enemene.log.debug(this.constructor.name, `Registering public read model endpoint ${chalk.bold(endpoint)}`);
                }
                if (readModel.prototype.$eventHandlers) {
                    readModel.prototype.$eventHandlers.forEach((handler: EventHandlerDefinition) => {
                        if (!this.eventToReadModelMap[handler.eventTypeName]) {
                            this.eventToReadModelMap[handler.eventTypeName] = [];
                        }
                        this.eventToReadModelMap[handler.eventTypeName].push(readModel.name);
                    });
                }
            });
        });
    }

    public getAllReadModelNames() {
        return Object.keys(this.readModelClasses);
    }

    public getReadModelNamesForEventType(eventTypeName: string): string[] {
        return this.eventToReadModelMap[eventTypeName] ?? [];
    }

    public getReadModelConstructor(name: string): ConstructorOf<ReadModel> {
        return this.readModelClasses[name];
    }

    public getReadModelForEndpoint(endpoint: string): ConstructorOf<ReadModel> {
        if (!this.endpointToReadModelMap[endpoint]) {
            throw new ObjectNotFoundError(endpoint);
        }
        return this.endpointToReadModelMap[endpoint];
    }
}