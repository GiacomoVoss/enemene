export interface BeforeCreateHook {
    onBeforeCreate(): Promise<void>;
}
