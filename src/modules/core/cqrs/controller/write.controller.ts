import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUser} from "../../auth";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {Enemene} from "../../application";
import {AbstractController, Body, Context, Controller, Path, Put} from "../../router";
import {CommandBus} from "../service/command-bus.service";
import {CommandRegistryService} from "../service/command-registry.service";

@Controller("command")
export class WriteController extends AbstractController {

    private commandRegistry: CommandRegistryService = Enemene.app.inject(CommandRegistryService);
    private commandBus: CommandBus = Enemene.app.inject(CommandBus);

    @Put("/:command/:id", true)
    async handle(@Path("id") aggregateId: string,
                 @Path("command") commandEndpoint: string,
                 @Context context: RequestContext<AbstractUser>,
                 @Body() body: Dictionary<serializable>) {
        await this.commandBus.executeCommand(this.commandRegistry.createCommand(commandEndpoint, body), aggregateId);
    }
}