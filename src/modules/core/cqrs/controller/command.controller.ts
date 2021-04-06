import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUserReadModel} from "../../auth";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {Enemene} from "../../application";
import {AbstractController, Body, Context, Controller, Get, Path, Put, Query} from "../../router";
import {CommandBus} from "../service/command-bus.service";
import {CommandRegistryService} from "../service/command-registry.service";
import {take} from "rxjs/operators";
import {has} from "lodash";

@Controller("command")
export class CommandController extends AbstractController {

    private commandRegistry: CommandRegistryService = Enemene.app.inject(CommandRegistryService);
    private commandBus: CommandBus = Enemene.app.inject(CommandBus);

    @Put("/:command/:id", true)
    async handle(@Path("id") aggregateId: string,
                 @Path("command") commandEndpoint: string,
                 @Query("version") aggregateVersionString: string,
                 @Context context: RequestContext<AbstractUserReadModel>,
                 @Body() body: Dictionary<serializable>) {
        let aggregateVersion: number = parseInt(aggregateVersionString ?? "0");
        if (isNaN(aggregateVersion)) {
            aggregateVersion = 0;
        }

        return this.commandBus.executeCommand(this.commandRegistry.createCommand(commandEndpoint, body), aggregateId, aggregateVersion, context).pipe(take(1)).toPromise();
    }

    @Get("/result/:id", true)
    async getResult(@Path("id") resultId: string,
                    @Context context: RequestContext<AbstractUserReadModel>) {
        if (has(this.commandBus.asyncResults, resultId)) {
            return this.commandBus.asyncResults[resultId];
        } else {
            return undefined;
        }
    }
}