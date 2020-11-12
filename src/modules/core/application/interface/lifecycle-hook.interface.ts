export interface LifecycleHook {
    onStart?(): Promise<void>;
}
