"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const index_1 = __importDefault(require("./index"));
const app = (0, express_1.default)();
const jsonParser = body_parser_1.default.json();
if (!process.env.PORT) {
    throw new Error('PORT environment variable is required');
}
const PORT = process.env.PORT;
app.get('/', jsonParser, async (req, res) => {
    await (0, index_1.default)(req, res);
});
app.listen(PORT, () => {
    console.log(`Webhooks is running on port ${PORT}`);
});
