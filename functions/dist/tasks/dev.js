"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const index_1 = __importDefault(require("./index"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const jsonParser = body_parser_1.default.json();
if (!process.env.TASKS_PORT) {
    throw new Error('TASKS_PORT environment variable is required');
}
const port = process.env.TASKS_PORT;
app.post('/', jsonParser, async (req, res) => {
    await (0, index_1.default)(req, res);
});
app.listen(port, () => {
    console.log(`Tasks is running on port ${port}`);
});
