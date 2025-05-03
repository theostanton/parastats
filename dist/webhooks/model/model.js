"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Failed = exports.Success = void 0;
exports.success = success;
exports.failed = failed;
exports.isFailed = isFailed;
function success(value) {
    return new Success(value);
}
function failed(message) {
    return new Failed(message);
}
function isFailed(result) {
    return !result.success;
}
class Success {
    constructor(value) {
        this.success = true;
        this.value = value;
    }
}
exports.Success = Success;
class Failed {
    constructor(error) {
        this.success = false;
        this.error = error;
    }
}
exports.Failed = Failed;
