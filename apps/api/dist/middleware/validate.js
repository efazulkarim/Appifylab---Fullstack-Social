export function validateBody(schema) {
    return (req, _res, next) => {
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            req.validationError = parsed.error.flatten();
            return next();
        }
        req.body = parsed.data;
        return next();
    };
}
export function validateQuery(schema) {
    return (req, _res, next) => {
        const parsed = schema.safeParse(req.query);
        if (!parsed.success) {
            req.validationError = parsed.error.flatten();
            return next();
        }
        req.query = parsed.data;
        return next();
    };
}
