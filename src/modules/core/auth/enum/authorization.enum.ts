export enum Authorization {
    /**
     * Route permissions are evaluated. If the requesting user has a permission for this route and method, everything happening inside the handler is permitted.
     */
    ROUTE = "ROUTE",

    /**
     * No permission evaluation. Handle with care!
     */
    PUBLIC = "PUBLIC",
}
