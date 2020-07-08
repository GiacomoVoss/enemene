"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewService = void 0;
const object_not_found_error_1 = require("../../error/object-not-found.error");
const filter_service_1 = require("../../filter/service/filter.service");
const model_service_1 = require("../../model/service/model.service");
const lodash_1 = require("lodash");
const collection_field_class_1 = require("../../model/interface/collection-field.class");
const many_to_many_field_class_1 = require("../../model/interface/many-to-many-field.class");
const log_service_1 = require("../../log/service/log.service");
/**
 * Service for handling views for data manipulation.
 */
class ViewService {
    /**
     * Initializes the ViewService by importing all available views and making them available.
     *
     * @param views
     */
    static init(views) {
        return __awaiter(this, void 0, void 0, function* () {
            const length = Object.entries(views).map(([viewName, view]) => {
                ViewService.addView(viewName, view);
                log_service_1.LogService.log.debug("[ViewService] Imported " + viewName);
                return view;
            }).length;
            log_service_1.LogService.log.info(`[ViewService] Imported ${length} Views.`);
        });
    }
    /**
     * Add a {@link View} to the view list.
     *
     * @param name Name of the view.
     * @param view The view.
     */
    static addView(name, view) {
        if (!ViewService.VIEWS[name]) {
            ViewService.VIEWS[name] = view;
        }
    }
    /**
     * Gets a {@link View} from the view list.
     *
     * @param viewName Name of the view.
     */
    static getView(viewName) {
        if (!ViewService.VIEWS[viewName]) {
            return null;
        }
        return Object.assign(Object.assign({}, ViewService.VIEWS[viewName]), { name: viewName });
    }
    /**
     * Gets a {@link View} from the view list.
     * Throws an {@link ObjectNotFoundError} if it wasn't found.
     *
     * @param viewName Name of the view.
     */
    static getViewNotNull(viewName) {
        const view = ViewService.getView(viewName);
        if (view === null) {
            throw new object_not_found_error_1.ObjectNotFoundError(viewName);
        }
        return view;
    }
    static getFields(view) {
        const fields = [];
        let fieldName;
        for (const viewField of view.fields) {
            if (typeof viewField === "string") {
                fieldName = viewField;
                fields.push(viewField);
            }
            else {
                const viewFieldDefinition = viewField;
                fieldName = viewFieldDefinition.field;
                fields.push(viewFieldDefinition.field);
                fields.push(...this.getFields(viewFieldDefinition.view).map(field => `${String(viewFieldDefinition.field)}.${field}`));
            }
            const entityField = model_service_1.ModelService.getFields(view.entity().name)[fieldName];
            if (entityField instanceof collection_field_class_1.CollectionField || entityField instanceof many_to_many_field_class_1.ManyToManyField) {
                fields.push(`${fieldName}.$count`);
            }
        }
        return fields;
    }
    static getFindOptions(view, user, additionalContext = {}) {
        const context = Object.assign({ currentUserId: user.id, currentUserRoleId: user.roleId }, additionalContext);
        let find = {};
        if (view.filter) {
            find = filter_service_1.FilterService.toSequelize(view.filter, context);
        }
        return find;
    }
    static getModelForView(view) {
        const model = model_service_1.ModelService.getModel(view.entity().name, ViewService.getFields(view));
        view.fields.forEach(field => {
            if (typeof field !== "string") {
                const viewFieldDefinition = field;
                lodash_1.merge(model, lodash_1.omit(model_service_1.ModelService.getModel(viewFieldDefinition.view.entity().name, ViewService.getFields(viewFieldDefinition.view)), "$root"));
                if (viewFieldDefinition.allowedValuesView) {
                    model[view.entity().name][viewFieldDefinition.field] = Object.assign(Object.assign({}, model[view.entity().name][viewFieldDefinition.field]), { allowedValues: viewFieldDefinition.allowedValuesView.name });
                }
            }
        });
        return model;
    }
}
exports.ViewService = ViewService;
ViewService.VIEWS = {};
//# sourceMappingURL=view.service.js.map