"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.CompileEntities = void 0;
const path = __importStar(require("path"));
const lodash_1 = require("lodash");
const file_service_1 = require("../../file/service/file.service");
class CompileEntities {
    static compile() {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log(path.join(__dirname, "..", "..", "src", "entities"));
            const moduleFiles = yield Promise.all(file_service_1.FileService.scanForFilePattern(path.join(__dirname, ".."), /.*\.model\.js/).map((file) => Promise.resolve().then(() => __importStar(require(file)))));
            moduleFiles.forEach(moduleFile => {
                const moduleName = Object.keys(moduleFile)[0];
                if (moduleName === "DataObject") {
                    return;
                }
                const module = Object.values(moduleFile)[0];
                const object = new module;
                const fileName = lodash_1.kebabCase(moduleName) + ".entity_.ts";
                // console.log(object.constructor.$collections);
                console.log(fileName);
                let fileContent = this.line(`${this.IMPORTS}\nexport class ${moduleName}_ extends Entity<${moduleName}_> {`);
                fileContent += Object.values(module.rawAttributes)
                    .map(CompileEntities.getInstanceField)
                    .map((value) => this.line(value, 1))
                    .join("");
                if (object.constructor.$collections) {
                    fileContent += Object.entries(object.constructor.$collections)
                        .map(this.getInstanceReferenceField)
                        .map((value) => this.line(value, 1))
                        .join("");
                }
                if (object.constructor.$references) {
                    console.log(object.constructor.$references);
                    fileContent += Object.entries(object.constructor.$references)
                        .map(this.getInstanceReferenceField)
                        .map((value) => this.line(value, 1))
                        .join("");
                }
                fileContent += this.line("");
                fileContent += Object.values(module.rawAttributes)
                    .map(CompileEntities.getStaticField)
                    .filter((value) => value)
                    .map((value) => this.line(value, 1))
                    .join("");
                if (object.constructor.$collections) {
                    fileContent += Object.entries(object.constructor.$collections)
                        .map(this.getStaticReferenceField)
                        .map((value) => this.line(value, 1))
                        .join("");
                }
                if (object.constructor.$references) {
                    fileContent += Object.entries(object.constructor.$references)
                        .map(this.getStaticReferenceField)
                        .map((value) => this.line(value, 1))
                        .join("");
                }
                fileContent += "}";
                console.log(fileContent);
                console.log("\n\n");
            });
        });
    }
    static line(line, tabs = 0) {
        return "\t".repeat(tabs) + `${line}\n`;
    }
    static getInstanceField(attribute) {
        let type = CompileEntities.getType(attribute.type);
        if (attribute.field === "id") {
            return `public id: SimpleEntityField = new SimpleEntityField("id", DataType.STRING, this.$parentField);`;
        }
        else {
            return `public ${attribute.field}: SimpleEntityField = new SimpleEntityField("${attribute.field}", ${type}, this.$parentField);`;
        }
    }
    static getInstanceReferenceField([name, clazz]) {
        return `public ${name}: ${clazz.name}_ = new ${clazz.name}_("${name}", this.$parentField);`;
    }
    static getStaticField(attribute) {
        let type = CompileEntities.getType(attribute.type);
        if (attribute.field === "id") {
            return `public static id: SimpleEntityField = new SimpleEntityField("id", "string");`;
        }
        else {
            return `public static ${attribute.field}: SimpleEntityField = new SimpleEntityField("${attribute.field}", ${type});`;
        }
    }
    static getStaticReferenceField([name, clazz]) {
        return `public static ${name}: ${clazz.name}_ = new ${clazz.name}_("${name}");`;
    }
    static getType(dataType) {
        if (dataType.toString().includes("VARCHAR")) {
            return "DataType.STRING";
        }
        else if (dataType.toString() === "DATETIME") {
            return "DataType.DATE";
        }
        else if (dataType.toString() === "DATE") {
            return "DataType.DATEONLY";
        }
        return dataType;
    }
}
exports.CompileEntities = CompileEntities;
CompileEntities.IMPORTS = `import {Entity} from "./entity.class";\nimport {SimpleEntityField} from "./simple-entity-field.class";\nimport {DataTypes} from "sequelize";`;
//# sourceMappingURL=compile-entities.js.map