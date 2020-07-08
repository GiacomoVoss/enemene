export class GetHandler {
    //
    // public static findAll<ENTITY extends DataObject<ENTITY>>(clazz: any, additionalFilter?: Filter<ENTITY>, additionalFields?: string[]): PathRequestHandlerFunction<ENTITY> {
    //     return async (req: ISecureRequest, path: PathDefinition) => {
    //         const data: ENTITY[] = await DataService.findAll(clazz, DataService.getFindOptions(clazz.name, req, path, additionalFilter));
    //         return await DataService.filterData(data, req, clazz.name, path.authorization, additionalFields);
    //     };
    // }
    //
    // public static findNotNullById<ENTITY extends DataObject<ENTITY>>(clazz: any, id: uuid, additionalFilter?: Filter<ENTITY>, additionalFields?: string[]): PathRequestHandlerFunction<ENTITY> {
    //     return async (req: ISecureRequest, path: PathDefinition) => {
    //         const data: ENTITY = await DataService.findNotNullById(clazz, id, DataService.getFindOptions(clazz.name, req, path, additionalFilter));
    //         return await DataService.filterData(data, req, clazz.name, path.authorization, additionalFields);
    //     };
    // }
    //
    // public static findNotNull<ENTITY extends DataObject<ENTITY>>(clazz: any, additionalFilter?: Filter<ENTITY>, additionalFields?: string[]): PathRequestHandlerFunction<ENTITY> {
    //     return async (req: ISecureRequest, path: PathDefinition) => {
    //         const data: ENTITY = await DataService.findNotNull(clazz, DataService.getFindOptions(clazz.name, req, path, additionalFilter));
    //         return await DataService.filterData(data, req, clazz.name, path.authorization, additionalFields);
    //     };
    // }
}
