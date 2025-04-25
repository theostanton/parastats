"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const index_1 = require("./index");
const users_1 = require("./users");
const model_1 = require("../model");
(0, vitest_1.test)('Test insert() / get() / getToken()', async () => {
    const container = await (0, index_1.generateContainer)();
    const user = {
        user_id: 123,
        token: "token",
        first_name: "Some name"
    };
    await users_1.users.insert(user);
    const userResult = await users_1.users.get(user.user_id);
    (0, vitest_1.expect)(userResult).toBeInstanceOf((model_1.Success));
    (0, vitest_1.expect)(userResult).toStrictEqual(new model_1.Success(user));
    const tokenResult = await users_1.users.getToken(user.user_id);
    (0, vitest_1.expect)(userResult).toBeInstanceOf((model_1.Success));
    (0, vitest_1.expect)(tokenResult).toStrictEqual(new model_1.Success(user.token));
    await (0, index_1.end)();
    await container.stop();
});
