import {expect, test} from "vitest";
import {generateContainer} from "./generateContainer.test";
import {PilotRow} from "./model";
import {Pilots} from "./pilots";
import {Success} from "../model";
import {end} from "./client";

test('insertActivities()', async () => {

    const container = await generateContainer()

    const user: PilotRow = {
        user_id: 123,
        token: "token",
        first_name: "Some name"
    }

    await Pilots.insert(user)

    const userResult = await Pilots.get(user.user_id)
    expect(userResult).toBeInstanceOf(Success<PilotRow>)
    expect(userResult).toStrictEqual(new Success(user))

    const tokenResult = await Pilots.getAccessToken(user.user_id)
    expect(userResult).toBeInstanceOf(Success<string>)
    expect(tokenResult).toStrictEqual(new Success(user.token))

    await end()
    await container.stop()
})