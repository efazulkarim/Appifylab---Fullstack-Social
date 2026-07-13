export class HttpError extends Error {
    statusCode;
    code;
    details;
    constructor(statusCode, code, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}
export function ok(res, data, pageInfo) {
    return res.json(pageInfo ? { data, pageInfo } : { data });
}
export function created(res, data) {
    return res.status(201).json({ data });
}
