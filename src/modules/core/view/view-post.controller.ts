import {Body, Context, Path, Post} from "../router";
import {DataObject} from "../model";
import {RequestMethod} from "../router/enum/request-method.enum";
import {DataResponse, DataService, Enemene, View, ViewFieldDefinition} from "../../..";
import {Dictionary} from "../../../base/type/dictionary.type";
import {serializable} from "../../../base/type/serializable.type";
import {AbstractViewController} from "./abstract-view-controller";
import {Controller} from "../router/decorator/controller.decorator";
import {ViewDefinition} from "./class/view-definition.class";
import {uuid} from "../../../enemene";
import {UnsupportedOperationError} from "../error/unsupported-operation.error";
import {EntityField} from "../model/interface/entity-field.class";
import {ModelService} from "../model/service/model.service";
import {pick} from "lodash";
import {CollectionField} from "../model/interface/collection-field.class";
import {CompositionField} from "../model/interface/composition-field.class";

@Controller("view")
export default class ViewPostController extends AbstractViewController {

    @Post("/:view", true)
    async createObject<ENTITY extends DataObject<ENTITY>>(@Path("view") viewName: string,
                                                          @Body() data: Dictionary<serializable>,
                                                          @Context() context: Dictionary<serializable>): Promise<DataResponse<ENTITY>> {
        const viewDefinition: ViewDefinition<ENTITY> = this.getViewDefinition(viewName, RequestMethod.POST, context);
        const view = new viewDefinition.viewClass();
        view.setValues(data);

        return {
            data: await this.viewService.save(view, context),
            model: viewDefinition.getModel(),
        };
    }

    //
    @Post("/:view/:id/:attribute", true)
    async createCollectionObject<ENTITY extends DataObject<ENTITY>>(@Path("view") viewName: string,
                                                                    @Path("id") objectId: uuid,
                                                                    @Path("attribute") collectionField: keyof ENTITY,
                                                                    @Body() data: Dictionary<serializable>,
                                                                    @Context() context: Dictionary<serializable>): Promise<DataResponse<ENTITY>> {
        const baseView: ViewDefinition<ENTITY> = this.getViewDefinition(viewName, RequestMethod.POST, context);
        const viewField: ViewFieldDefinition<ENTITY, any> | undefined = baseView.fields.find(field => field.name === collectionField);
        if (!viewField || !viewField.isArray) {
            throw new UnsupportedOperationError(`Field ${collectionField} not found.`);
        }

        const fields: string[] = baseView.getFields();

        const baseObject: DataObject<ENTITY> = await DataService.findNotNullById(baseView.entity, objectId, this.viewService.getFindOptions(baseView, context, {
            include: [{model: viewField.subView.prototype.$view.entity, as: collectionField as string}]
        }));
        const baseModel: Dictionary<EntityField, keyof ENTITY> = ModelService.getFields(baseView.entity.name);

        const subFields: string[] = fields
            .filter(field => field.startsWith(`${String(collectionField)}.`))
            .map((field: string) => field.substr(field.indexOf(".") + 1));
        const filteredData: Dictionary<serializable> = pick(data, subFields);
        const fieldModel = baseModel[collectionField];

        let object: DataObject<ENTITY>;
        const transaction = await Enemene.app.db.transaction();
        try {
            if (fieldModel instanceof CollectionField) {
                filteredData[fieldModel.foreignKey] = objectId;
                object = await DataService.create(fieldModel.classGetter(), filteredData, context, undefined, transaction);
                await baseObject.$add(fieldModel.name as any, object, {
                    transaction,
                });
            } else if (fieldModel instanceof CompositionField) {
                filteredData[fieldModel.foreignKey] = objectId;
                object = await DataService.create(fieldModel.classGetter(), filteredData, context, undefined, transaction);
                await baseObject.$set(fieldModel.name as any, object, {
                    transaction,
                });
            }
            transaction.commit();
        } catch (e) {
            transaction.rollback();
            throw e;
        }

        const resultObject: View<any> = this.viewService.wrap(object, viewField.subView.prototype.$view);

        return {
            data: resultObject,
            model: ModelService.getModel(object.$entity, subFields),
        };
    }
}
