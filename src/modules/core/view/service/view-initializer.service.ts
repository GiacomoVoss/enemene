import {ObjectNotFoundError} from "../../error/object-not-found.error";
import {EntityField} from "../../model/interface/entity-field.class";
import {ModelService} from "../../model/service/model.service";
import {Dictionary} from "../../../../base/type/dictionary.type";
import chalk from "chalk";
import {DataObject, Enemene, UuidService, ViewFieldDefinition} from "../../../..";
import {ConstructorOf} from "../../../../base/constructor-of";
import {View} from "../class/view.class";
import {FileService} from "../../file/service/file.service";
import {ViewDefinition} from "../class/view-definition.class";

/**
 * Service for handling views for data manipulation.
 */
export class ViewInitializerService {

    private fileService: FileService = Enemene.app.inject(FileService);
    private static VIEWS: Dictionary<ConstructorOf<View<any>>> = {};
    private static SELECTION_VIEW_DEFINITIONS: Dictionary<ViewDefinition<any>> = {};

    /**
     * Initializes the views by importing all available views and making them available.
     */
    public async init() {
        const viewFiles: string[] = this.fileService.scanForFilePattern(Enemene.app.config.modulesPath, /.*\.view\.js/);
        await Promise.all(viewFiles.map((filePath: string) => import(filePath)));
        Object.entries(Enemene.app.db.models).forEach(([entity, model]) => {
            const fields: ViewFieldDefinition<any, any>[] = ModelService.getDisplayPatternFields(entity)
                .map((entityField: EntityField, position: number) => new ViewFieldDefinition(entityField.name as any, {name: "String"}, {
                    position,
                }));
            ViewInitializerService.SELECTION_VIEW_DEFINITIONS[entity] = new ViewDefinition<any>(
                UuidService.getUuid(),
                () => model,
                class SelectionView extends View<any> {
                    $fields = fields;
                    public $view: any = {
                        entity: model,
                    };
                },
                fields,
            );
        });
        Object.entries(ModelService.VIRTUAL_MODELS).forEach(([entity, model]) => {
            const fields: ViewFieldDefinition<any, any>[] = ModelService.getDisplayPatternFields(entity)
                .map((entityField: EntityField, position: number) => new ViewFieldDefinition(entityField.name as any, {name: "String"}, {
                    position,
                }));
            ViewInitializerService.SELECTION_VIEW_DEFINITIONS[entity] = new ViewDefinition<any>(
                UuidService.getUuid(),
                () => model,
                class SelectionView extends View<any> {
                    $fields = fields;
                    public $view: any = {
                        entity: model,
                    };
                },
                fields,
            );
        });
    }

    public getAllViews(): Dictionary<ConstructorOf<View<any>>> {
        return ViewInitializerService.VIEWS;
    }

    /**
     * Add a {@link View} to the view list.
     *
     * @param viewClass The view.
     */
    public static addViewClass(viewClass: ConstructorOf<View<any>>): void {
        if (this.VIEWS[viewClass.name]) {
            throw new Error(`Duplicate view ${chalk.bold(viewClass.name)}`);
        }
        this.validate(viewClass);
        this.VIEWS[viewClass.prototype.$view.id] = viewClass;
    }

    public static getViewDefinition(viewId: string): ViewDefinition<any> {
        let viewClass = this.VIEWS[viewId];

        if (!viewClass) {
            viewClass = Object.values(this.VIEWS).find(view => view.name === viewId);
        }

        if (!viewClass) {
            throw new ObjectNotFoundError(viewId);
        }

        return viewClass.prototype.$view;
    }

    public static getSelectionViewDefinition<ENTITY extends DataObject<ENTITY>>(entity: ConstructorOf<ENTITY>): ViewDefinition<ENTITY> {
        return this.SELECTION_VIEW_DEFINITIONS[entity.name];
    }

    private static validate(viewClass: ConstructorOf<View<any>>): void {
        const viewDefinition: ViewDefinition<any> = viewClass.prototype.$view;
        const entityFields: Dictionary<EntityField> | undefined = viewDefinition.entity ? ModelService.getFields(viewDefinition.entity.name) : undefined;
        for (const viewField of viewDefinition.fields) {
            const name: string = viewField.name;
            if (entityFields && !entityFields[name] && !viewField.calculated) {
                Enemene.log.error(this.constructor.name, `Error validating ${chalk.underline(viewClass.name)}: Field ${chalk.bold(name)} does not exist in entity ${chalk.bold(viewDefinition.entity.name)}.`);
            }
        }
    }
}
