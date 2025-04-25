"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const index_1 = require("./index");
(0, vitest_1.test)('Test fetchWingedActivities', async () => {
    const api = new index_1.StravaApi("");
});
(0, vitest_1.test)('Test fetchWingedActivities', async () => {
    const api = new index_1.StravaApi("");
    const athlete = await api.fetchAthlete();
    (0, vitest_1.expect)(athlete.firstname).toEqual("Theo");
});
