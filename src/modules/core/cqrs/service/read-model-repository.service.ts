import {Event} from "../entity/event.model";
import {ReadModel} from "../class/read-model.class";
import {ReadModelRegistryService} from "./read-model-registry.service";
import {EnemeneCqrs} from "../../application";
import {EventHandlerDefinition} from "../interface/event-handler-definition.interface";
import {AbstractEvent} from "../class/abstract-event.class";
import {ObjectRepositoryService} from "./object-repository.service";

export class ReadModelRepositoryService {

    private readModelRegistryService: ReadModelRegistryService = EnemeneCqrs.app.inject(ReadModelRegistryService);
    private objectRepository: ObjectRepositoryService = EnemeneCqrs.app.inject(ObjectRepositoryService);

    async init(): Promise<void> {
        this.readModelRegistryService.getAllReadModelNames().forEach(readModelName => {
            this.objectRepository.objects[readModelName] = {};
        });
    }

    public handleEvent(event: AbstractEvent, metadata: Event) {
        this.readModelRegistryService.getReadModelNamesForEventType(metadata.eventType).forEach(readModelName => {
            const handler: EventHandlerDefinition = this.readModelRegistryService.getReadModelConstructor(readModelName).prototype.$eventHandlers[metadata.eventType];
            if (!handler.global && !handler.idExtractor) {
                this.objectRepository.getOrCreateObject(readModelName, metadata.aggregateId);
            }
            const readModels: ReadModel[] = Object.values(this.objectRepository.objects[readModelName]);
            Object.values(readModels).forEach(readModel => this.handleReadModelEvent(readModel, event, metadata, handler));
        });
    }

    private handleReadModelEvent(readModel: ReadModel, event: AbstractEvent, metadata: Event, handler: EventHandlerDefinition) {
        if (readModel.$eventPosition >= metadata.position) {
            return;
        }
        if (readModel.id === metadata.aggregateId || handler.global || (handler.idExtractor && handler.idExtractor(event) === readModel.id)) {
            handler.handler.apply(readModel, [event, metadata]);
            readModel.version = readModel.version + 1;
            readModel.$eventPosition = metadata.position;
        }
    }
}