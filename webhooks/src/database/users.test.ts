import {expect, it, test} from "vitest";
import {end, generateContainer} from "./index";
import {users} from "./users";
import {Success} from "../model";

test('Test insert() / get() / getToken()', async () => {

    const container = await generateContainer()

    const user: UserRow = {
        user_id: 123,
        token: "token",
        first_name: "Some name"
    }

    await users.insert(user)

    const userResult = await users.get(user.user_id)
    expect(userResult).toBeInstanceOf(Success<UserRow>)
    expect(userResult).toStrictEqual(new Success(user))

    const tokenResult = await users.getToken(user.user_id)
    expect(userResult).toBeInstanceOf(Success<string>)
    expect(tokenResult).toStrictEqual(new Success(user.token))

    await end()
    await container.stop()
})