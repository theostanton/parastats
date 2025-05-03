"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Failed = exports.Success = void 0;
class Success {
    constructor(value) {
        this.value = value;
    }
}
exports.Success = Success;
class Failed {
    constructor(error) {
        this.error = error;
    }
}
exports.Failed = Failed;
