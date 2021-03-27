import {RequestContext} from "../../router/interface/request-context.interface";
import {Enemene} from "../../application";
import {AbstractController, Context, Controller, Get, Path, Query} from "../../router";
import {ReadModelRepositoryService} from "../service/read-model-repository.service";
import {ReadModel} from "../class/read-model.class";
import {ConstructorOf} from "../../../../base/constructor-of";
import {ReadModelRegistryService} from "../service/read-model-registry.service";
import {AbstractUserReadModel} from "../../auth/interface/abstract-user-read-model.interface";

@Controller("read")
export class ReadController extends AbstractController {

    private readModelRepository: ReadModelRepositoryService = Enemene.app.inject(ReadModelRepositoryService);
    private readModelRegistry: ReadModelRegistryService = Enemene.app.inject(ReadModelRegistryService);

    @Get("/:endpoint/:id", true)
    async getObject(@Path("endpoint") endpoint: string,
                    @Path("id") id: string,
                    @Query("path") path: string,
                    @Context context: RequestContext<AbstractUserReadModel>) {
        const readModelClass: ConstructorOf<ReadModel> | undefined = this.readModelRegistry.getReadModelForEndpoint(endpoint);
        return this.readModelRepository.getObjectWithPermissions(readModelClass, id, context, path);
    }

    @Get("/:endpoint", true)
    async getList(@Path("endpoint") endpoint: string,
                  @Query("fields") fields: string,
                  @Context context: RequestContext<AbstractUserReadModel>) {
        const readModelClass: ConstructorOf<ReadModel> | undefined = this.readModelRegistry.getReadModelForEndpoint(endpoint);
        return this.readModelRepository.getObjectsWithPermissions(readModelClass, context, fields);
    }
}