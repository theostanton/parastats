import {beforeAll, expect, it, test} from "vitest";
import {StravaApi} from "./index";
import {getDatabase} from "../database/client";
import {users} from "../database/users";
import getToken = users.getToken;


let token: string | undefined;

beforeAll(async () => {
    const result = await getToken(4142500)
    if (result.success) {
        token = result.value
    } else {
        throw new Error("Failed to get token from server")
    }
})

test('Test fetchWingedActivities', async () => {
    const api = new StravaApi(token)
    const result = await api.fetchWingedActivities()
    expect(result.success).toEqual(true)
    if (result.success) {
        expect(result.value.length).toEqual(5)
    }
}, {timeout: 60_000})

test('Test fetchAthlete', async () => {
    const api = new StravaApi(token)

    const athlete = await api.fetchAthlete()

    expect(athlete.firstname).toEqual("Theo")
})