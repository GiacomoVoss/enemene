import { View } from "..";
import { FindOptions } from "sequelize";
import { EntityField } from "../../model/interface/entity-field.class";
import { Dictionary } from "../../../../base/type/dictionary.type";
import { AbstractUser } from "../../auth";
/**
 * Service for handling views for data manipulation.
 */
export declare class ViewService {
    private static VIEWS;
    /**
     * Initializes the ViewService by importing all available views and making them available.
     *
     * @param views
     */
    static init(views: Dictionary<View<any>>): Promise<void>;
    /**
     * Add a {@link View} to the view list.
     *
     * @param name Name of the view.
     * @param view The view.
     */
    static addView(name: string, view: View<any>): void;
    /**
     * Gets a {@link View} from the view list.
     *
     * @param viewName Name of the view.
     */
    static getView(viewName: string): View<any>;
    /**
     * Gets a {@link View} from the view list.
     * Throws an {@link ObjectNotFoundError} if it wasn't found.
     *
     * @param viewName Name of the view.
     */
    static getViewNotNull(viewName: string): View<any>;
    static getFields(view: View<any>): string[];
    static getFindOptions(view: View<any>, user: AbstractUser, additionalContext?: object): FindOptions;
    static getModelForView(view: View<any>): Dictionary<Dictionary<EntityField> | string>;
}
