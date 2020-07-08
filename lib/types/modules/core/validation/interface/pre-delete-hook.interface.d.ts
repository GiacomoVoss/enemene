export interface PreDeleteHook {
    preDelete(): Promise<void>;
}
