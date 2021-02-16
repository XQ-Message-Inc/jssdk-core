export default class  ValidationException{
    /**
     * @param {Number} code
     * @param {String} reason
     */
    constructor(code, reason) {
        this.code=code;
        this.reason=reason;
    }
}