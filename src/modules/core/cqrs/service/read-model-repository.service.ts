import {Event} from "../entity/event.model";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {ReadModel} from "../class/read-model.class";
import {ReadModelRegistryService} from "./read-model-registry.service";
import {Enemene, EnemeneCqrs} from "../../application";
import {uuid} from "../../../../base/type/uuid.type";
import {EventHandlerDefinition} from "../interface/event-handler-definition.interface";
import {EventRegistryService} from "./event-registry.service";
import {AbstractEvent} from "../class/abstract-event.class";
import {ObjectNotFoundError} from "../../error";
import {get} from "lodash";
import {EventRepositoryService} from "./event-repository.service";
import {RequestContext} from "../../router/interface/request-context.interface";
import {ConstructorOf} from "../../../../base/constructor-of";
import {UnrestrictedRequestContext} from "../../router";
import {PermissionCqrsService} from "../../auth/service/permission-cqrs.service";
import {AbstractUserReadModel} from "../../auth/interface/abstract-user-read-model.interface";

export class ReadModelRepositoryService {

    private readModelRegistryService: ReadModelRegistryService = EnemeneCqrs.app.inject(ReadModelRegistryService);
    private eventRegistryService: EventRegistryService = EnemeneCqrs.app.inject(EventRegistryService);
    private eventRepository: EventRepositoryService = EnemeneCqrs.app.inject(EventRepositoryService);
    private permissionCqrsService: PermissionCqrsService = EnemeneCqrs.app.inject(PermissionCqrsService);

    readModels: Dictionary<Dictionary<ReadModel>> = {};

    async init(): Promise<void> {
        this.readModelRegistryService.getAllReadModelNames().forEach(readModelName => {
            this.readModels[readModelName] = {};
        });
        const events: Event[] = await this.eventRepository.getAllEventsUntilNow();

        events
            .forEach(event => this.handleEvent(event));
        this.startEventListener();
    }

    public getObjectWithPermissions<T extends ReadModel>(readModel: ConstructorOf<T>, id: uuid, context: RequestContext<AbstractUserReadModel>, path?: string, includeDeleted: boolean = false): T {
        const object: ReadModel | undefined = this.readModels[readModel.name]?.[id];
        const shouldIncludeDeleted = context instanceof UnrestrictedRequestContext && includeDeleted;

        if (!object) {
            throw new ObjectNotFoundError(readModel.name);
        }

        if (object.deleted && !shouldIncludeDeleted) {
            throw new ObjectNotFoundError(readModel.name);
        }

        return this.getByPath(this.permissionCqrsService.getFilteredObject(object, context, this), path);
    }

    public getObject<T extends ReadModel>(readModel: ConstructorOf<T>, id: uuid, includeDeleted: boolean = false): T | null {
        const object: T | undefined = this.readModels[readModel.name]?.[id] as T | undefined;

        if (!object) {
            return null;
        }

        if (object.deleted && !includeDeleted) {
            return null;
        }

        return object;
    }

    public getObjectsWithPermissions<T extends ReadModel>(readModel: ConstructorOf<T>, context: RequestContext<AbstractUserReadModel>, path?: string, includeDeleted: boolean = false): T[] {
        const objects: Dictionary<ReadModel> | undefined = this.readModels[readModel.name];
        const shouldIncludeDeleted = context instanceof UnrestrictedRequestContext && includeDeleted;

        if (!objects) {
            throw new ObjectNotFoundError(readModel.name);
        }

        return this.permissionCqrsService.getFilteredObjects(Object.values(objects), context, this)
            .filter(object => !object.deleted || shouldIncludeDeleted)
            .map(object => this.getByPath(object, path));
    }

    public getObjects<T extends ReadModel>(readModel: ConstructorOf<T>, includeDeleted: boolean = false): T[] {
        const objects: Dictionary<T> | undefined = this.readModels[readModel.name] as Dictionary<T> | undefined;

        if (!objects) {
            throw new ObjectNotFoundError(readModel.name);
        }

        return Object.values(objects)
            .filter(object => !object.deleted || includeDeleted);
    }

    private getByPath(object: object, path?: string): any {
        if (!path) {
            return object;
        }

        return get(object, path);
    }

    public handleEvent(metadata: Event) {
        const event: AbstractEvent = this.eventRegistryService.parseEvent(metadata);
        EnemeneCqrs.log.debug(this.constructor.name, `Event: ${metadata.eventType} (${metadata.aggregateId})`);
        this.readModelRegistryService.getReadModelNamesForEventType(metadata.eventType).forEach(readModelName => {
            if (!this.readModels[readModelName][metadata.aggregateId]) {
                this.readModels[readModelName][metadata.aggregateId] = this.getOrCreateObject(readModelName, metadata.aggregateId);
            }
            const readModels: ReadModel[] = Object.values(this.readModels[readModelName]);
            Object.values(readModels).forEach(readModel => {
                const handler: EventHandlerDefinition = readModel.$eventHandlers.find(h => h.eventTypeName === metadata.eventType);
                if (readModel.id === metadata.aggregateId || handler.global || (handler.idExtractor && handler.idExtractor(event) === metadata.aggregateId)) {
                    handler.handler.apply(readModel, [event, metadata]);
                }
            });
        });
    }

    private startEventListener() {
        Event.afterCreate((object: Event) => {
            Enemene.app.inject(ReadModelRepositoryService).handleEvent(object);
        });
        Event.afterBulkCreate((objects: Event[]) => {
            const readModelRepository: ReadModelRepositoryService = Enemene.app.inject(ReadModelRepositoryService);
            objects.forEach(object => readModelRepository.handleEvent(object));
        });
    }

    public getOrCreateObject<T extends ReadModel>(name: string | ConstructorOf<T>, id: uuid): T {
        const readModelName: string = typeof name === "string" ? name : name.name;
        if (!this.readModels[readModelName][id]) {
            this.readModels[readModelName][id] = new (this.readModelRegistryService.getReadModelConstructor(readModelName))(id);
        }
        return this.readModels[readModelName][id] as T;
    }
}