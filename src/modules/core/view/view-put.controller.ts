import {Body, Context, Controller, CurrentUser, Path, Put} from "../router";
import {ViewService} from "./service/view.service";
import {DataResponse, DataService} from "../data";
import {DataObject} from "../model";
import {AbstractUser} from "../auth";
import {RequestMethod} from "../router/enum/request-method.enum";
import {Dictionary} from "../../../base/type/dictionary.type";
import {pick} from "lodash";
import {uuid} from "../../../base/type/uuid.type";
import {serializable} from "../../../base/type/serializable.type";
import {PermissionService} from "../auth/service/permission.service";
import {FindOptions} from "sequelize";
import {Enemene} from "../../..";
import {AbstractController} from "../router/class/abstract-controller.class";
import {View} from "./class/view.class";

@Controller("view")
export default class ViewPutController extends AbstractController {

    private viewService: ViewService = Enemene.app.inject(ViewService);

    getView<ENTITY extends DataObject<ENTITY>>(viewName: string, user: AbstractUser): View<ENTITY> {
        Enemene.app.inject(PermissionService).checkViewPermission(viewName, RequestMethod.PUT, user);
        return this.viewService.getViewNotNull(viewName);
    }

    @Put("/:view/:id", true)
    async updateObject<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                          @Path("view") viewName: string,
                                                          @Path("id") objectId: uuid,
                                                          @Body() data: Dictionary<serializable>,
                                                          @Context() context: Dictionary<serializable>): Promise<DataResponse<ENTITY>> {
        const view: View<ENTITY> = this.getView(viewName, user);
        const viewFindOptions: FindOptions = this.viewService.getFindOptions(view, ["*"], user, context);

        let object: DataObject<ENTITY> = await DataService.findNotNullById(view.entity(), objectId, {where: viewFindOptions.where});

        const fields: string[] = view.getFields();
        const filteredData: Dictionary<serializable> = pick(data, fields);

        await DataService.update(view.entity(), object, filteredData);
        return {
            data: await this.viewService.findById(view, objectId, ["*"], user, context),
            model: view.getModel(),
        };
    }
}
