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

    private aggregateClasses: Dictionary<ConstructorOf<Aggregate>> = {};
    private commandToAggregateMap: Dictionary<string> = {};
    private eventToAggregateMap: Dictionary<string> = {};

    async init(): Promise<void> {
        const aggregateFiles: string[] = this.fileService.scanForFilePattern(Enemene.app.config.modulesPath, /.*\.aggregate\.js/);
        const aggregateModules: Dictionary<ConstructorOf<Aggregate>>[] = await Promise.all(aggregateFiles.map((filePath: string) => import(filePath)));

        const systemModules = await import("../aggregate");

        [systemModules, ...aggregateModules].forEach((moduleMap: Dictionary<ConstructorOf<Aggregate>>) => {
            Object.values(moduleMap).forEach((aggregate: ConstructorOf<Aggregate>) => {
                EnemeneCqrs.log.debug(this.constructor.name, `Registering aggregate ${chalk.bold(aggregate.name)}`);
                this.aggregateClasses[aggregate.name] = aggregate;
                if (aggregate.prototype.$commandHandlers) {
                    aggregate.prototype.$commandHandlers.forEach((handler: CommandHandlerDefinition) => {
                        if (this.commandToAggregateMap[handler.endpoint]) {
                            throw new Error(`Duplicate command handler for ${handler.endpoint} in ${aggregate.name}`);
                        }
                        this.commandToAggregateMap[handler.endpoint] = aggregate.name;
                    });
                }
                if (aggregate.prototype.$eventHandlers) {
                    Object.keys(aggregate.prototype.$eventHandlers).forEach(eventTypeName => {
                        this.eventToAggregateMap[eventTypeName] = aggregate.name;
                    });
                }
            });
        });
    }

    getAggregateInstanceForCommand(commandEndpoint: string): Aggregate {
        return this.getAggregateInstance(this.commandToAggregateMap[commandEndpoint]);
    }

    getAggregateClassForCommand(commandEndpoint: string): ConstructorOf<Aggregate> {
        return this.aggregateClasses[this.commandToAggregateMap[commandEndpoint]];
    }

    getAggregateClassForEvent(eventType: string): ConstructorOf<Aggregate> {
        return this.aggregateClasses[this.eventToAggregateMap[eventType]];
    }

    getAggregateClass(aggregateName: string): ConstructorOf<Aggregate> {
        if (!this.aggregateClasses[aggregateName]) {
            throw new ObjectNotFoundError(aggregateName);
        }
        return this.aggregateClasses[aggregateName];
    }

    getAggregateInstance(aggregateName: string): Aggregate {
        const aggregateClass: ConstructorOf<Aggregate> = this.getAggregateClass(aggregateName);
        return new aggregateClass();
    }
}