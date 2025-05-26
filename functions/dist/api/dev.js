"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
if (!process.env.API_PORT) {
    throw new Error('API_PORT environment variable is required');
}
const PORT = process.env.API_PORT;
index_1.app.listen(PORT, () => {
    console.log(`API is running on port ${PORT}`);
});
