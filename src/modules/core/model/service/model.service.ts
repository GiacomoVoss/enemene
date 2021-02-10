import {EntityField} from "../interface/entity-field.class";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {camelCase, snakeCase} from "lodash";
import {DataObject} from "../data-object.model";
import {ManyToManyField} from "../interface/many-to-many-field.class";
import {CompositionField} from "../interface/composition-field.class";
import {CollectionField} from "../interface/collection-field.class";
import {ReferenceField} from "../interface/reference-field.class";
import {EntityFieldType} from "../enum/entity-field-type.enum";
import {AbstractFilter, AbstractUser, Enemene, File, Filter, Role, RoutePermission, UuidService, ViewPermission} from "../../../..";
import {UnsupportedOperationError} from "../../error/unsupported-operation.error";
import {RequestContext} from "../../router/interface/request-context.interface";
import {FileService} from "../../file/service/file.service";
import {DataType, DataTypes, Model} from "sequelize";
import chalk from "chalk";
import {ModelAttributeColumnOptions, ModelAttributes} from "sequelize/types/lib/model";
import * as bcrypt from "bcrypt";
import {genSaltSync} from "bcrypt";
import {CalculatedField} from "../interface/calculated-field.class";
import {BelongsToManyOptions} from "sequelize/types/lib/associations";
import {ConstructorOf} from "../../../../base/constructor-of";

export class ModelService {

    public static MODEL: Dictionary<Dictionary<EntityField>> = {};

    public static getFields<T>(entity: string): Dictionary<EntityField, keyof T> {
        return (ModelService.MODEL[entity] || {}) as Dictionary<EntityField, keyof T>;
    }

    public static getModel(entity: string, requestedFields: string[]): Dictionary<EntityField> {
        const modelFields: Dictionary<EntityField> = ModelService.MODEL[entity];
        return Object.values(modelFields)
            .filter((field: EntityField) => requestedFields.includes(field.name) || requestedFields.includes("*"))
            .reduce((map: Dictionary<EntityField>, field: EntityField) => {
                map[field.name] = field;
                return map;
            }, {});
    }

    public static getDisplayPatternFields(entity: string): EntityField[] {
        const object: DataObject<any> = Enemene.app.db.model(entity).build() as DataObject<any>;
        let fields: string[] = [];
        const matches: RegExpMatchArray | null = object.$displayPattern.match(/\{\w+\}/g);
        if (matches) {
            fields = matches.map((token: string) => token.replace(/[}{]/g, ""));
        }
        fields.push("id");
        return Object.values(this.getModel(entity, fields));
    }

    public static getAllowedValuesFilter<ENTITY extends DataObject<ENTITY>, SUBENTITY extends DataObject<SUBENTITY>>(entityClass: ConstructorOf<ENTITY>,
                                                                                                                     field: keyof ENTITY,
                                                                                                                     context: RequestContext<AbstractUser>): AbstractFilter {
        const fieldModel: EntityField = ModelService.getFields(entityClass.name)[field as string];
        if (fieldModel.isSimpleField || fieldModel instanceof CompositionField) {
            throw new UnsupportedOperationError("Cannot get allowed values for simple or composition fields");
        }
        const object: ENTITY = new entityClass();
        const allowedValuesMap: Dictionary<Function, keyof ENTITY> = object.$allowedValues ?? {};
        const allowedValuesFn: Function = allowedValuesMap[field];

        if (allowedValuesFn) {
            return allowedValuesFn.apply(object, [context]) as AbstractFilter;
        } else {
            return Filter.true();
        }
    }

    public async init(app: Enemene) {
        const db = app.db;
        await db.authenticate();
        const systemModels = [
            {Role},
            {RoutePermission},
            {ViewPermission},
            {File},
        ];
        const modelFiles: string[] = app.inject(FileService).scanForFilePattern(app.config.modulesPath, /.*\.model\.js/);
        const modules: any[] = await Promise.all(modelFiles.map((filePath: string) => import(filePath)));

        [...systemModels, ...modules].forEach((moduleMap: Dictionary<typeof Model>) => {
            const [modelName, module] = Object.entries(moduleMap)[0];
            ModelService.MODEL[modelName].id = new EntityField("id", "ID", EntityFieldType.UUID, true);
            const fields: Dictionary<EntityField> = ModelService.MODEL[modelName];
            const attributes: ModelAttributes = {
                id: {
                    type: DataTypes.STRING,
                    unique: true,
                    primaryKey: true,
                    allowNull: false,
                    defaultValue: () => UuidService.getUuid(),
                }
            };

            Object.entries(fields)
                .filter(([_, entityField]) => entityField.isSimpleField && entityField.name !== "id")
                .forEach(([propertyKey, entityField]) => {
                    const options: ModelAttributeColumnOptions = {
                        type: ModelService.getDataType(entityField.type),
                        allowNull: !entityField.required,
                        defaultValue: entityField.options.defaultValue,
                    };
                    if (entityField.type === EntityFieldType.STRING_ARRAY) {
                        options.get = function (this: Model) {
                            const value = this.getDataValue(propertyKey as keyof Model) as any;
                            return value ? JSON.parse(value) : undefined;
                        };
                        options.set = function (this: Model, value: string) {
                            this.setDataValue(propertyKey as keyof Model, value as any);
                        };
                    }

                    if (entityField.type === EntityFieldType.PASSWORD) {
                        options.set = function (this: Model, value: string) {
                            console.log(propertyKey, value, genSaltSync());
                            this.setDataValue(propertyKey as keyof Model, bcrypt.hashSync(value, genSaltSync()) as any);
                        };
                    }

                    if (entityField.type === EntityFieldType.CALCULATED) {
                        options.type = DataTypes.VIRTUAL;
                        options.get = function (this: Model) {
                            (entityField as CalculatedField).fn.apply(this);
                        };
                    }

                    attributes[propertyKey] = options;
                });

            app.log.debug(modelName, `Registering model ${chalk.bold(modelName)} (${Object.keys(attributes)}).`);
            // @ts-ignore
            module.init(attributes, {
                sequelize: db,
                tableName: snakeCase(modelName),
                getterMethods: {
                    $entity: () => modelName,
                }
            });
        });

        Object.entries(ModelService.MODEL).forEach(([modelName, fields]) => {
            Object.entries(fields)
                .filter(([_, entityField]) => !entityField.isSimpleField)
                .forEach(([propertyKey, entityField]) => {
                    if (entityField instanceof ReferenceField || entityField instanceof CompositionField) {
                        app.log.debug(this.constructor.name, `Registering belongsTo (${chalk.bold(modelName + "." + propertyKey)} => ${chalk.bold(entityField.classGetter().name)}).`);
                        db.model(modelName).belongsTo(db.model(entityField.classGetter().name), {
                            as: propertyKey,
                            foreignKey: {
                                field: propertyKey + "Id",
                                name: propertyKey + "Id",
                                allowNull: !entityField.required,
                            },
                            onUpdate: "CASCADE",
                            onDelete: entityField.required ? "RESTRICT" : "SET NULL",
                            constraints: true,
                            foreignKeyConstraint: true
                        });
                        ModelService.MODEL[modelName][`${propertyKey}Id`] = new EntityField(`${propertyKey}Id`, `${entityField.label} ID`, EntityFieldType.UUID, false, {
                            references: {
                                model: entityField.classGetter().name,
                            }
                        });
                    }
                });
        });

        Object.entries(ModelService.MODEL).forEach(([modelName, fields]) => {
            Object.entries(fields)
                .filter(([_, entityField]) => !entityField.isSimpleField)
                .forEach(([propertyKey, entityField]) => {
                    if (entityField instanceof CollectionField) {
                        if (entityField.mappedBy) {
                            const mappedField: EntityField = ModelService.MODEL[entityField.classGetter().name][entityField.mappedBy];
                            (ModelService.MODEL[modelName][propertyKey] as CollectionField).composition = mappedField.required;
                            app.log.debug(this.constructor.name, `Registering hasMany (${chalk.bold(modelName + "." + propertyKey)} => ${chalk.bold(entityField.classGetter().name)}).`);
                            db.model(modelName).hasMany(db.model(entityField.classGetter().name), {
                                as: propertyKey,
                                foreignKey: {
                                    field: entityField.foreignKey,
                                    name: entityField.foreignKey,
                                    allowNull: !mappedField.required,
                                },
                                onUpdate: entityField.required ? "RESTRICT" : "SET NULL",
                                onDelete: entityField.required ? "RESTRICT" : "SET NULL",
                                constraints: true,
                                foreignKeyConstraint: true
                            });
                            ModelService.MODEL[entityField.classGetter().name][`${propertyKey}Id`] = new EntityField(`${propertyKey}Id`, `${entityField.label} ID`, EntityFieldType.UUID, false, {
                                references: {
                                    model: entityField.classGetter().name,
                                }
                            });
                        } else {
                            app.log.debug(this.constructor.name, `Registering belongsToMany (${chalk.bold(modelName + "." + propertyKey)} => ${chalk.bold(entityField.classGetter().name)}).`);
                            db.model(modelName).belongsToMany(db.model(entityField.classGetter().name), {
                                through: snakeCase(modelName + entityField.classGetter().name),
                                as: propertyKey,
                                foreignKey: {
                                    field: propertyKey + "Id",
                                    name: propertyKey + "Id",
                                    allowNull: false,
                                },
                                constraints: true,
                                foreignKeyConstraint: true
                            });
                        }
                    } else if (entityField instanceof ManyToManyField) {
                        app.log.debug(this.constructor.name, `Registering manyToMany (${chalk.bold(modelName + "." + propertyKey)} => ${chalk.bold(entityField.classGetter().name)}).`);
                        let through: typeof Model;
                        let attributes: ModelAttributes = {};
                        let options: Partial<BelongsToManyOptions> = {};
                        if (entityField.throughGetter) {
                            through = entityField.throughGetter();
                        } else {
                            const throughTokens: string[] = [modelName, entityField.classGetter().name];
                            throughTokens.sort();
                            const throughModelName = throughTokens.join("");
                            const foreignKey: string = `${camelCase(modelName)}Id`;
                            const otherKey: string = `${camelCase(entityField.classGetter().name)}Id`;
                            attributes[foreignKey] = {
                                type: DataTypes.STRING,
                                unique: true,
                                allowNull: false,
                                field: foreignKey,
                            };
                            attributes[otherKey] = {
                                type: DataTypes.STRING,
                                unique: true,
                                allowNull: false,
                                field: otherKey,
                            };
                            options.foreignKey = {
                                name: foreignKey,
                                field: foreignKey,
                            };
                            options.otherKey = {
                                name: `${camelCase(entityField.classGetter().name)}Id`,
                                field: `${camelCase(entityField.classGetter().name)}Id`,
                            };
                            through = db.define(throughModelName, attributes, {
                                tableName: snakeCase(throughModelName),
                            });
                        }
                        db.model(modelName).belongsToMany(db.model(entityField.classGetter().name), {
                            through,
                            ...options,
                            as: propertyKey,
                            constraints: true,
                            foreignKeyConstraint: true
                        });
                    }
                });
        });
    }

    public static getDataType(type: EntityFieldType): DataType {

        if (Array.isArray(type)) {
            return DataTypes.ENUM(...type);
        }
        switch (type) {
            case EntityFieldType.STRING:
            case EntityFieldType.PASSWORD:
            case EntityFieldType.UUID:
            case EntityFieldType.EMAIL:
                return DataTypes.STRING;
            case EntityFieldType.STRING_ARRAY:
                return DataTypes.JSON;
            case EntityFieldType.TEXT:
                return DataTypes.TEXT;
            case EntityFieldType.DATE:
                return DataTypes.DATE;
            case EntityFieldType.INTEGER:
                return DataTypes.INTEGER;
            case EntityFieldType.DECIMAL:
                return DataTypes.DECIMAL;
            case EntityFieldType.BOOLEAN:
                return DataTypes.BOOLEAN;
            case EntityFieldType.CALCULATED:
                return DataTypes.VIRTUAL;
            default:
                throw new Error(`EntityFieldType ${type} could not be mapped.`);
        }
    }
}
