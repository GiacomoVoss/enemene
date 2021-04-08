import {RequestContext} from "../../router/interface/request-context.interface";
import {Enemene} from "../../application";
import {AbstractController, Context, Controller, Get, Path, Query} from "../../router";
import {ReadModel} from "../class/read-model.class";
import {ConstructorOf} from "../../../../base/constructor-of";
import {ReadModelRegistryService} from "../service/read-model-registry.service";
import {AbstractUserReadModel} from "../../auth/interface/abstract-user-read-model.interface";
import {ObjectRepositoryService} from "../service/object-repository.service";

@Controller("read")
export class ReadController extends AbstractController {

    private objectRepository: ObjectRepositoryService = Enemene.app.inject(ObjectRepositoryService);
    private readModelRegistry: ReadModelRegistryService = Enemene.app.inject(ReadModelRegistryService);

    @Get("/:endpoint/:id", true)
    async getObject(@Path("endpoint") endpoint: string,
                    @Path("id") id: string,
                    @Query("fields") fieldsString: string,
                    @Query("includeDeleted") deleted: boolean,
                    @Context context: RequestContext<AbstractUserReadModel>) {
        const readModelClass: ConstructorOf<ReadModel> | undefined = this.readModelRegistry.getReadModelForEndpoint(endpoint);
        return this.objectRepository.getObjectWithPermissions(readModelClass, id, context, fieldsString, !!deleted);
    }

    @Get("/:endpoint", true)
    async getList(@Path("endpoint") endpoint: string,
                  @Query("fields") fields: string,
                  @Query("limit") limitString: string,
                  @Query("offset") offsetString: string,
                  @Query("order") orderString: string,
                  @Query("filter") filterString: string,
                  @Query("includeDeleted") deleted: boolean,
                  @Context context: RequestContext<AbstractUserReadModel>) {
        const readModelClass: ConstructorOf<ReadModel> | undefined = this.readModelRegistry.getReadModelForEndpoint(endpoint);
        const result = this.objectRepository.getObjectsWithPermissions(readModelClass, context, ObjectRepositoryService.getObjectsQueryInput(fields, orderString, limitString, offsetString, filterString), !!deleted);
        return result;
    }

    @Get("/count/:endpoint", true)
    async count(@Path("endpoint") endpoint: string,
                @Query("filter") filterString: string,
                @Query("includeDeleted") deleted: boolean,
                @Context context: RequestContext<AbstractUserReadModel>) {
        const readModelClass: ConstructorOf<ReadModel> | undefined = this.readModelRegistry.getReadModelForEndpoint(endpoint);
        return {
            count: this.objectRepository.countObjectsWithPermission(readModelClass, context, ObjectRepositoryService.getObjectsQueryInput(undefined, undefined, undefined, undefined, filterString), !!deleted)
        };
    }
}