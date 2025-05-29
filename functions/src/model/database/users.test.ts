import {expect, test} from "vitest";
import {end} from "./client";
import {Pilots} from "./pilots";
import {Success} from "../model";
import {generateContainer} from "./generateContainer.test";
import {PilotRow, PilotRowFull} from "./model";

test('Test insert() / get() / getToken()', async () => {

    const container = await generateContainer()

    const expiresAt = new Date(2000, 1, 2, 3, 4)

    const user: PilotRowFull = {
        user_id: 123,
        strava_access_token: "access_token",
        strava_refresh_token: "refresh_token",
        strava_expires_at: expiresAt,
        first_name: "Some name"
    }

    await Pilots.insert(user)

    const userResult = await Pilots.getFull(user.user_id)
    expect(userResult).toBeInstanceOf(Success<PilotRow>)
    expect(userResult).toStrictEqual(new Success(user))

    const tokenResult = await Pilots.getAccessToken(user.user_id)
    expect(userResult).toBeInstanceOf(Success<string>)
    expect(tokenResult).toStrictEqual(new Success(user.strava_access_token))

    await end()
    await container.stop()
})