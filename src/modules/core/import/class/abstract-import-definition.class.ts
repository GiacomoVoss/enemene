import {ConstructorOf} from "../../../../base/constructor-of";
import {DataObject} from "../../model";
import {Filter} from "../../filter/class/filter.class";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {AbstractFilter, DataService, Enemene} from "../../../..";

export abstract class AbstractImportDefinition<TARGET extends DataObject<TARGET>> {

    protected abstract requiredFields: string[];

    public abstract getFilter?(): AbstractFilter;

    public abstract getEntity(): ConstructorOf<TARGET>;

    protected abstract getObject(data: Dictionary<serializable>): Dictionary<serializable>;

    public filterObjects(objects: Dictionary<serializable>[]): Dictionary<serializable>[] {
        const filter: AbstractFilter = this.getFilter() ?? Filter.true();
        return objects
            .filter((object: Dictionary<serializable>) => filter.evaluate(object));
    }

    public async import(objects: Dictionary<serializable>[]): Promise<void> {
        const datasToImport: Dictionary<serializable>[] = this.filterObjects(objects);
        const total: number = datasToImport.length;
        Enemene.log.info(this.constructor.name, `Importing ${total} objects...`);
        for (const data of datasToImport) {
            const dataObject: Dictionary<serializable> = this.getObject(data);
            await DataService.create(this.getEntity(), dataObject, {});
        }
    }
}
