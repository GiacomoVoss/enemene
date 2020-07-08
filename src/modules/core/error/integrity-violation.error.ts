import {RuntimeError} from "../interface/runtime-error.interface";

export class IntegrityViolationError extends Error implements RuntimeError {

    statusCode: number = 423;
    type: string = "IntegrityViolationError";

    constructor() {
        super("Diese Aktion kann zur Wahrung von Integrität (Referenzen, bereits vorliegende Daten, ...) nicht ausgeführt werden.");
    }
}

