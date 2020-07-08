export interface PostUpdateHook {
    postUpdate(): Promise<void>;
}