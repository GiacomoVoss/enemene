export class CustomResponse<DATA> {
    constructor(public status: number,
                public data: DATA) {
    }
}
