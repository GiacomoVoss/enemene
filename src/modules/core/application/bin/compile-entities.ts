import {ModelAttributeColumnOptions} from "sequelize";
import * as path from "path";
import {kebabCase} from "lodash";
import {FileService} from "../../file/service/file.service";

export class CompileEntities {

    private static IMPORTS: string = `import {Entity} from "./entity.class";\nimport {SimpleEntityField} from "./simple-entity-field.class";\nimport {DataTypes} from "sequelize";`;

    public static async compile(): Promise<void> {
        // console.log(path.join(__dirname, "..", "..", "src", "entities"));
        const moduleFiles = await Promise.all(FileService.scanForFilePattern(path.join(__dirname, ".."), /.*\.model\.js/).map((file: string) => import(file)));
        moduleFiles.forEach(moduleFile => {
            const moduleName = Object.keys(moduleFile)[0] as string;
            if (moduleName === "DataObject") {
                return;
            }
            const module = Object.values(moduleFile)[0] as any;
            const object = new module;
            const fileName = kebabCase(moduleName) + ".entity_.ts";
            // console.log(object.constructor.$collections);
            console.log(fileName);

            let fileContent = this.line(`${this.IMPORTS}\nexport class ${moduleName}_ extends Entity<${moduleName}_> {`);
            fileContent += Object.values(module.rawAttributes)
                .map(CompileEntities.getInstanceField)
                .map((value: string) => this.line(value, 1))
                .join("");

            if (object.constructor.$collections) {
                fileContent += Object.entries(object.constructor.$collections)
                    .map(this.getInstanceReferenceField)
                    .map((value: string) => this.line(value, 1))
                    .join("");
            }
            if (object.constructor.$references) {
                console.log(object.constructor.$references);
                fileContent += Object.entries(object.constructor.$references)
                    .map(this.getInstanceReferenceField)
                    .map((value: string) => this.line(value, 1))
                    .join("");
            }

            fileContent += this.line("");

            fileContent += Object.values(module.rawAttributes)
                .map(CompileEntities.getStaticField)
                .filter((value: string) => value)
                .map((value: string) => this.line(value, 1))
                .join("");

            if (object.constructor.$collections) {
                fileContent += Object.entries(object.constructor.$collections)
                    .map(this.getStaticReferenceField)
                    .map((value: string) => this.line(value, 1))
                    .join("");
            }

            if (object.constructor.$references) {
                fileContent += Object.entries(object.constructor.$references)
                    .map(this.getStaticReferenceField)
                    .map((value: string) => this.line(value, 1))
                    .join("");
            }

            fileContent += "}";
            console.log(fileContent);
            console.log("\n\n");
        });
    }

    private static line(line: string, tabs: number = 0): string {
        return "\t".repeat(tabs) + `${line}\n`;
    }

    private static getInstanceField(attribute: ModelAttributeColumnOptions): string {
        let type: string = CompileEntities.getType(attribute.type as string);
        if (attribute.field === "id") {
            return `public id: SimpleEntityField = new SimpleEntityField("id", DataType.STRING, this.$parentField);`;
        } else {
            return `public ${attribute.field}: SimpleEntityField = new SimpleEntityField("${attribute.field}", ${type}, this.$parentField);`;
        }
    }

    private static getInstanceReferenceField([name, clazz]: [string, any]): string {
        return `public ${name}: ${clazz.name}_ = new ${clazz.name}_("${name}", this.$parentField);`;
    }

    private static getStaticField(attribute: ModelAttributeColumnOptions): string {
        let type: string = CompileEntities.getType(attribute.type as string);
        if (attribute.field === "id") {
            return `public static id: SimpleEntityField = new SimpleEntityField("id", "string");`;
        } else {
            return `public static ${attribute.field}: SimpleEntityField = new SimpleEntityField("${attribute.field}", ${type});`;
        }
    }

    private static getStaticReferenceField([name, clazz]: [string, any]): string {
        return `public static ${name}: ${clazz.name}_ = new ${clazz.name}_("${name}");`;
    }

    private static getType(dataType: any): string {
        if (dataType.toString().includes("VARCHAR")) {
            return "DataType.STRING";
        } else if (dataType.toString() === "DATETIME") {
            return "DataType.DATE";
        } else if (dataType.toString() === "DATE") {
            return "DataType.DATEONLY";
        }
        return dataType;
    }
}
