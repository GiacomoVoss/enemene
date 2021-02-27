export interface Command {
    endpoint: string;

    method: "UPDATE" | "CREATE";

    data: any;
}