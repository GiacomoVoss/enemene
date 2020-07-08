export interface RuntimeError extends Error {
    type: string;
    statusCode?: number;
}
