export interface BeforeDeleteHook {
    onBeforeDelete(): Promise<void>;
}
