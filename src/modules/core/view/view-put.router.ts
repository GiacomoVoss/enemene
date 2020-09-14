import {Body, Context, CurrentUser, Path, Put, RouterModule} from "../router";
import {ViewService} from "./service/view.service";
import {DataResponse, DataService} from "../data";
import {DataObject} from "../model";
import {AbstractUser} from "../auth";
import {RequestMethod} from "../router/enum/request-method.enum";
import {View} from "./";
import {Dictionary} from "../../../base/type/dictionary.type";
import {pick} from "lodash";
import {uuid} from "../../../base/type/uuid.type";
import {serializable} from "../../../base/type/serializable.type";
import {PermissionService} from "../auth/service/permission.service";
import {FindOptions} from "sequelize";

@RouterModule("view")
export default class ViewPutRouter {

    @Put("/:view/:id", true)
    async updateObject<ENTITY extends DataObject<ENTITY>>(@CurrentUser user: AbstractUser,
                                                          @Path("view") viewName: string,
                                                          @Path("id") objectId: uuid,
                                                          @Body() data: Dictionary<serializable>,
                                                          @Context() context: Dictionary<serializable>): Promise<DataResponse<ENTITY>> {
        PermissionService.checkViewPermission(viewName, RequestMethod.PUT, user);

        const view: View<ENTITY> = ViewService.getViewNotNull(viewName);
        const viewFindOptions: FindOptions = ViewService.getFindOptions(view, ["*"], user, context);

        let object: DataObject<ENTITY> = await DataService.findNotNullById(view.entity(), objectId, {where: viewFindOptions.where});

        const fields: string[] = ViewService.getFields(view);
        const filteredData: Dictionary<serializable> = pick(data, fields);

        await DataService.update(view.entity(), object, filteredData);
        return {
            data: await ViewService.findById(view, objectId, ["*"], user, context),
            model: ViewService.getModelForView(view),
        };
    }
}
