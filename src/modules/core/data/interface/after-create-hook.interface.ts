export interface AfterCreateHook {
    onAfterCreate(): Promise<void>;
}
