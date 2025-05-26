"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhooks = webhooks;
exports.tasks = tasks;
const webhooks_1 = __importDefault(require("./webhooks"));
const tasks_1 = __importDefault(require("./tasks"));
const api_1 = require("./api");
// noinspection JSUnusedGlobalSymbols
async function webhooks(req, res) {
    await (0, webhooks_1.default)(req, res);
}
// noinspection JSUnusedGlobalSymbols
async function tasks(req, res) {
    await (0, tasks_1.default)(req, res);
}
// noinspection JSUnusedGlobalSymbols
// export async function api(req: Request, res: Response): Promise<void> {
//     await apiHandler(req, res);
// }
exports.api = api_1.app;
