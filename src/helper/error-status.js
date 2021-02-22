export default class ErrorStatus extends Error {
    constructor(message, httpStatus) {
        super(message);
        this.name = "Error Status";
        this.httpStatus = httpStatus || 500;
    }
}