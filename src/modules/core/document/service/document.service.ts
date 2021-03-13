import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import * as fs from "fs";
import {uuid} from "../../../../base/type/uuid.type";
import {UuidService} from "../../service/uuid.service";
import {Enemene} from "../../application";
import {DataFileService} from "../../file";
import puppeteer from "puppeteer/lib/cjs/puppeteer/node-puppeteer-core";
import path from "path";
import Handlebars from "handlebars";
import {DateService} from "../../service/date.service";
import {GenerateDocumentOptions} from "../interface/generate-document-options.interface";
import {GeneratedDocument} from "../interface/generated-document.interface";


export class DocumentService {

    private dataFileService: DataFileService = Enemene.app.inject(DataFileService);

    public generatedDocuments: Dictionary<GeneratedDocument> = {};

    onStart(): void {
        Handlebars.registerHelper("date", (date: Date) => {
            return DateService.formatDate(date);
        });
        Handlebars.registerHelper("datetime", (date: Date) => {
            return DateService.formatDateTime(date);
        });
        Handlebars.registerHelper("equals", (value1: any, value2: any) => {
            return value1 === value2;
        });
    }

    public async generateDocumentFromFile(templateFilePath: string, context: Dictionary<serializable> = {}, options: GenerateDocumentOptions = {}): Promise<uuid> {
        const fileContent: Buffer = fs.readFileSync(templateFilePath);
        const template: HandlebarsTemplateDelegate = Handlebars.compile(fileContent.toString("utf8"));
        const fileId: uuid = UuidService.getUuid();
        const browser = await puppeteer.launch({args: ["--no-sandbox", "--disable-setuid-sandbox"]});
        const page = await browser.newPage();
        await page.setCacheEnabled(false);
        await page.setContent(template({
            ...this.getDefaultContext(),
            ...context,
        }), {
            waitUntil: "networkidle2",
        });
        await page.emulateMediaType("screen");

        await this.dataFileService.ensureDirectoryExists(DataFileService.TMP_FILE_PATH);
        await page.pdf({
            path: path.join(DataFileService.TMP_FILE_PATH, fileId),
            format: "a4",
            printBackground: true,
            displayHeaderFooter: !!options.headline || options.showPageNumbers,
            headerTemplate: this.getHeaderTemplate(options.headline),
            footerTemplate: this.getFooterTemplate(options.showPageNumbers),
            margin: {
                top: "0.5cm",
                right: "0.5cm",
                bottom: "1cm",
                left: "0.5cm"
            },
        });

        await browser.close();

        this.generatedDocuments[fileId] = {
            file: path.join(DataFileService.TMP_FILE_PATH, fileId),
            fileName: options.fileName ?? "GeneratedDocument.pdf",
            generatedAt: new Date(),
        };

        return fileId;
    }

    public getGeneratedDocument(id: uuid): GeneratedDocument {
        const document: GeneratedDocument | undefined = this.generatedDocuments[id];
        if (!document) {
            return null;
        }

        if (DateService.diff(document.generatedAt, new Date(), "minute") > 5) {
            return null;
        }

        return document;
    }

    private getHeaderTemplate(headerText?: string): string {
        return headerText ? `<span style="width: 100%; text-align: left; padding-left: 1cm; font-size: 10pt; color: #aaa;">${headerText}</span>` : "<span></span>";
    }

    private getFooterTemplate(showPageNumbers: boolean = false): string {
        return showPageNumbers ? `<span style="width: 100%; text-align: right; padding-right: 1cm; font-size: 8pt; color: #aaa;"><span class="pageNumber"></span> / <span class="totalPages"></span></span>` : "";
    }

    private getDefaultContext(): Dictionary<serializable> {
        return {
            now: new Date(),
        };
    }
}