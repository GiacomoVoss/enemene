import {EnemeneCqrs} from "../../application";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {ConstructorOf} from "../../../../base/constructor-of";
import {Saga} from "../class/saga.class";
import chalk from "chalk";
import {ObjectNotFoundError} from "../../error";
import {CommandHandlerDefinition} from "../interface/command-handler-definition.interface";
import {EventRepositoryService} from "./event-repository.service";
import {EventRegistryService} from "./event-registry.service";
import {AbstractEvent} from "../class/abstract-event.class";
import {Event} from "../entity/event.model";
import {EventHandlerDefinition} from "../interface/event-handler-definition.interface";
import {CommandExecution} from "../interface/command-execution.interface";
import {AbstractCommand} from "../class/abstract-command.class";
import {CommandBus} from "./command-bus.service";
import {concatMap} from "rxjs/operators";
import {fromPromise} from "rxjs/internal-compatibility";
import {FileRegistryService} from "../../service/file-registry.service";

export class SagaRepositoryService extends FileRegistryService {

    private eventRepository: EventRepositoryService = EnemeneCqrs.app.inject(EventRepositoryService);
    private eventRegistry: EventRegistryService = EnemeneCqrs.app.inject(EventRegistryService);
    private commandBus: CommandBus = EnemeneCqrs.app.inject(CommandBus);

    private sagaClasses: Dictionary<ConstructorOf<Saga>> = {};
    private commandToSagaMap: Dictionary<string> = {};
    private eventToSagaMap: Dictionary<string[]> = {};
    private sagas: Dictionary<Saga> = {};

    async init(): Promise<void> {
        (await this.loadFiles(/.*\.saga\.js/)).forEach((saga: ConstructorOf<Saga>) => {
            EnemeneCqrs.log.debug(this.constructor.name, `Registering saga ${chalk.bold(saga.name)}`);
            this.sagaClasses[saga.name] = saga;
            if (saga.prototype.$commandHandlers) {
                saga.prototype.$commandHandlers.forEach((handler: CommandHandlerDefinition) => {
                    if (this.commandToSagaMap[handler.endpoint]) {
                        throw new Error(`Duplicate command handler for ${handler.endpoint} in ${saga.name}`);
                    }
                    this.commandToSagaMap[handler.endpoint] = saga.name;
                });
            }
            if (saga.prototype.$eventHandlers) {
                Object.keys(saga.prototype.$eventHandlers).forEach(eventTypeName => {
                    if (!this.eventToSagaMap[eventTypeName]) {
                        this.eventToSagaMap[eventTypeName] = [];
                    }
                    this.eventToSagaMap[eventTypeName].push(saga.name);
                });
            }
        });

        this.eventRepository.queue
            .pipe(concatMap(event => fromPromise(this.handleEvent(this.eventRegistry.parseEvent(event), event))))
            .subscribe();
    }

    public async handleEvent(event: AbstractEvent, metadata: Event): Promise<void> {
        if (this.eventToSagaMap[metadata.eventType] && this.eventToSagaMap[metadata.eventType].length) {
            await Promise.all(this.eventToSagaMap[metadata.eventType].map(async sagaName => {
                const saga = this.getSagaInstance(sagaName);
                const handler: EventHandlerDefinition = this.getSagaClass(sagaName).prototype.$eventHandlers[metadata.eventType];
                let commands: CommandExecution<AbstractCommand> | CommandExecution<AbstractCommand>[] | null = await handler.handler.apply(saga, [event, metadata]);
                if (commands === null) {
                    return;
                }
                if (!Array.isArray(commands)) {
                    commands = [commands];
                }

                for (const execution of commands) {
                    this.commandBus.executeCommand(execution.command, execution.aggregateId, undefined, metadata.correlationId);
                }
            }));
        }
    }

    getSagaClass(sagaName: string): ConstructorOf<Saga> {
        if (!this.sagaClasses[sagaName]) {
            throw new ObjectNotFoundError(sagaName);
        }
        return this.sagaClasses[sagaName];
    }

    getSagaInstance(sagaName: string): Saga {
        if (!this.sagas[sagaName]) {
            const sagaClass: ConstructorOf<Saga> = this.getSagaClass(sagaName);
            this.sagas[sagaName] = new sagaClass();
        }
        return this.sagas[sagaName];
    }
}