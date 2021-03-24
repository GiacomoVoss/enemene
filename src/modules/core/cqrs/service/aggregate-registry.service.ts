import {Enemene, EnemeneCqrs} from "../../application";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {ConstructorOf} from "../../../../base/constructor-of";
import {FileService} from "../../file/service/file.service";
import {Aggregate} from "../class/aggregate.class";
import chalk from "chalk";
import {ObjectNotFoundError} from "../../error";
import {CommandHandlerDefinition} from "../interface/command-handler-definition.interface";

export class AggregateRegistryService {

    private fileService: FileService = Enemene.app.inject(FileService);

    private aggregates: Dictionary<ConstructorOf<Aggregate>> = {};
    private commandToAggregateMap: Dictionary<string> = {};

    async init(): Promise<void> {
        const aggregateFiles: string[] = this.fileService.scanForFilePattern(Enemene.app.config.modulesPath, /.*\.aggregate\.js/);
        const aggregateModules: Dictionary<ConstructorOf<Aggregate>>[] = await Promise.all(aggregateFiles.map((filePath: string) => import(filePath)));

        const systemModules = await import("../aggregate");

        [systemModules, ...aggregateModules].forEach((moduleMap: Dictionary<ConstructorOf<Aggregate>>) => {
            Object.values(moduleMap).forEach((aggregate: ConstructorOf<Aggregate>) => {
                EnemeneCqrs.log.debug(this.constructor.name, `Registering aggregate ${chalk.bold(aggregate.name)}`);
                this.aggregates[aggregate.name] = aggregate;
                if (aggregate.prototype.$commandHandlers) {
                    aggregate.prototype.$commandHandlers.forEach((handler: CommandHandlerDefinition) => {
                        if (this.commandToAggregateMap[handler.endpoint]) {
                            throw new Error("Duplicate command handler: " + handler.endpoint);
                        }
                        this.commandToAggregateMap[handler.endpoint] = aggregate.name;
                    });
                }
            });
        });
    }

    getAggregateInstanceForCommand(commandEndpoint: string): Aggregate {
        return this.getAggregateInstance(this.commandToAggregateMap[commandEndpoint]);
    }

    getAggregateClass(aggregateName: string): ConstructorOf<Aggregate> {
        if (!this.aggregates[aggregateName]) {
            throw new ObjectNotFoundError(aggregateName);
        }
        return this.aggregates[aggregateName];
    }

    getAggregateInstance(aggregateName: string): Aggregate {
        const aggregateClass: ConstructorOf<Aggregate> = this.getAggregateClass(aggregateName);
        return new aggregateClass();
    }
}