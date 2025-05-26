"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const index_1 = __importDefault(require("./index"));
(0, vitest_1.test)("wingActivity success", async () => {
    const input = {
        name: "WingActivity",
        activityId: 123,
    };
    const result = await (0, index_1.default)(input);
    (0, vitest_1.expect)(result.success).toEqual(true);
});
(0, vitest_1.test)("wingActivity fail on invalid body", async () => {
    const input = {
        name: "FetchAllActivities",
        userId: 123
    };
    const result = await (0, index_1.default)(input);
    (0, vitest_1.expect)(result.success).toEqual(false);
});
