export interface PostCreateHook {
    postCreate(): Promise<void>;
}