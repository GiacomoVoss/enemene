import {Body, Context, Path, Post, Req} from "../router";
import {DataObject} from "../model";
import {RequestMethod} from "../router/enum/request-method.enum";
import {AbstractUser, DataResponse, SecureRequest, UuidService, View, ViewFieldDefinition} from "../../..";
import {Dictionary} from "../../../base/type/dictionary.type";
import {serializable} from "../../../base/type/serializable.type";
import {AbstractViewController} from "./abstract-view-controller";
import {Controller} from "../router/decorator/controller.decorator";
import {ViewDefinition} from "./class/view-definition.class";
import {uuid} from "../../../enemene";
import {get} from "lodash";
import {RequestContext} from "../router/interface/request-context.interface";
import {InputValidationError} from "../validation/error/input-validation.error";

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

    // @Post("/:view/:id/:attribute", true)
    // async createCollectionObject<ENTITY extends DataObject<ENTITY>>(@Path("view") viewName: string,
    //                                                                 @Path("id") objectId: uuid,
    //                                                                 @Path("attribute") collectionField: keyof ENTITY,
    //                                                                 @Body() data: Dictionary<serializable>,
    //                                                                 @Context() context: Dictionary<serializable>): Promise<DataResponse<ENTITY>> {
    //     const baseView: ViewDefinition<ENTITY> = this.getViewDefinition(viewName, RequestMethod.POST, context);
    //     const viewField: ViewFieldDefinition<ENTITY, any> | undefined = baseView.fields.find(field => field.name === collectionField);
    //     if (!viewField || !viewField.isArray) {
    //         throw new UnsupportedOperationError(`Field ${collectionField} not found.`);
    //     }
    //
    //     const fields: string[] = baseView.getFields();
    //
    //     const baseObject: DataObject<ENTITY> = await DataService.findNotNullById(baseView.entity, objectId, this.viewService.getFindOptions(baseView, context, {
    //         include: [{model: viewField.subView.prototype.$view.entity, as: collectionField as string}]
    //     }));
    //     const baseModel: Dictionary<EntityField, keyof ENTITY> = ModelService.getFields(baseView.entity.name);
    //
    //     const subFields: string[] = fields
    //         .filter(field => field.startsWith(`${String(collectionField)}.`))
    //         .map((field: string) => field.substr(field.indexOf(".") + 1));
    //     const filteredData: Dictionary<serializable> = pick(data, subFields);
    //     const fieldModel = baseModel[collectionField];
    //
    //     let object: DataObject<ENTITY>;
    //     const transaction = await Enemene.app.db.transaction();
    //     try {
    //         if (fieldModel instanceof CollectionField) {
    //             filteredData[fieldModel.foreignKey] = objectId;
    //             object = await DataService.create(fieldModel.classGetter(), filteredData, context, undefined, transaction);
    //             // await baseObject.$add(fieldModel.name as any, object, {
    //             //     transaction,
    //             // });
    //         } else if (fieldModel instanceof CompositionField) {
    //             filteredData[fieldModel.foreignKey] = objectId;
    //             object = await DataService.create(fieldModel.classGetter(), filteredData, context, undefined, transaction);
    //             // await baseObject.$set(fieldModel.name as any, object, {
    //             //     transaction,
    //             // });
    //         }
    //         transaction.commit();
    //     } catch (e) {
    //         transaction.rollback();
    //         throw e;
    //     }
    //
    //     const resultObject: View<any> = this.viewService.wrap(object, viewField.subView.prototype.$view);
    //
    //     return {
    //         data: resultObject,
    //         model: ModelService.getModel(object.$entity, subFields),
    //     };
    // }


    @Post("/:view/:id/*", true)
    async createInPath<ENTITY extends DataObject<ENTITY>>(@Path("view") viewName: string,
                                                          @Path("id") objectId: uuid,
                                                          @Req request: SecureRequest,
                                                          @Body() data: Dictionary<serializable>,
                                                          @Context() context: RequestContext<AbstractUser>): Promise<DataResponse<ENTITY>> {

        const attributePath = request.params[0];
        if (!attributePath || !attributePath.length) {
            return this.createObject(viewName, data, context);
        }
        const attributeTokens: string[] = attributePath.split("/");
        const collectionAttribute: string = attributeTokens.pop();

        const viewDefinition: ViewDefinition<ENTITY> = this.getViewDefinition(viewName, RequestMethod.POST, context);
        let object: View<ENTITY> = await this.viewService.findById(viewDefinition, objectId, context);
        for (const token of attributeTokens) {
            if (Array.isArray(object)) {
                if (UuidService.isUuid(token)) {
                    object = object.find((obj: any) => obj.id === token);
                } else if (!isNaN(Number.parseInt(token))) {
                    object = object[Number.parseInt(token)];
                } else {
                    throw new InputValidationError([{
                        type: "field",
                        field: "attributePath",
                        message: `Invalid attribute path: ${attributePath}`,
                    }]);
                }
            } else {
                object = get(object, token);
            }
        }


        if (!(object instanceof View)) {
            throw new InputValidationError([{
                type: "field",
                field: "attributePath",
                message: `Invalid attribute path: ${attributePath}`,
            }]);
        }

        const collectionViewField: ViewFieldDefinition<any, any> | undefined = object.$view.fields.find(viewField => viewField.isArray && viewField.name === collectionAttribute);

        if (!collectionViewField) {
            throw new InputValidationError([{
                type: "field",
                field: "attributePath",
                message: `Invalid attribute path: ${attributePath}`,
            }]);
        }

        const newSubView: View<any> = new collectionViewField.subView();
        newSubView.setValues(data);
        object.setValues({
            ...object,
            [collectionAttribute]: [
                ...(object[collectionAttribute] ?? []),
                data,
            ],
        });

        return {
            data: await this.viewService.save(object, context),
            model: viewDefinition.getModel(),
        };
    }
}
