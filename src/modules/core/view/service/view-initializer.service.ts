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

            ViewInitializerService.SELECTION_VIEW_DEFINITIONS[entity] = new ViewDefinition<any>(
                UuidService.getUuid(),
                () => model,
                class SelectionView extends View<any> {
                    public $view: any = {
                        entity: model,
                    };
                },
                ModelService.getDisplayPatternFields(entity)
                    .map((entityField: EntityField, position: number) => new ViewFieldDefinition(entityField.name as any, {name: "String"}, {
                        position,
                    })),
            );
        });
    }

    public getAllViews(): string[] {
        return Object.keys(ViewInitializerService.VIEWS);
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
        Enemene.log.debug(this.constructor.name, `Registering view ${chalk.bold(viewClass.name)} (${viewClass.prototype.$view.id}).`);
        this.validate(viewClass);
        this.VIEWS[viewClass.name] = viewClass;
        this.VIEWS[viewClass.prototype.$view.id] = viewClass;
    }

    public static getViewDefinition(viewName: string): ViewDefinition<any> {
        let viewClass = this.VIEWS[viewName];

        if (!viewClass) {
            throw new ObjectNotFoundError(viewName);
        }

        return viewClass.prototype.$view;
    }

    public static getSelectionViewDefinition<ENTITY extends DataObject<ENTITY>>(entity: ConstructorOf<ENTITY>): ViewDefinition<ENTITY> {
        return this.SELECTION_VIEW_DEFINITIONS[entity.name];
    }

    private static validate(viewClass: ConstructorOf<View<any>>): void {
        const viewDefinition: ViewDefinition<any> = viewClass.prototype.$view;
        const entityFields: Dictionary<EntityField> = ModelService.getFields(viewDefinition.entity.name);
        for (const viewField of viewDefinition.fields) {
            const name: string = viewField.name;
            if (!entityFields[name]) {
                Enemene.log.error(this.constructor.name, `Error validating ${chalk.underline(viewClass.name)}: Field ${chalk.bold(name)} does not exist in entity ${chalk.bold(viewDefinition.entity.name)}.`);
            }
        }
    }
}
