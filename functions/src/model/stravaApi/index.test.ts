import {isSuccess} from "@parastats/common";
import {beforeAll, expect, it, test} from "vitest";
import {StravaApi} from "./index";
import {Pilots} from "../database/Pilots";
import getToken = Pilots.getAccessToken;


let token: string | undefined;

beforeAll(async () => {
    const result = await getToken(4142500)
    if (isSuccess(result)) {
        token = result.value
    } else {
        throw new Error("Failed to get token from server")
    }
})

test.skip('Test fetchWingedActivities', {timeout: 60_000}, async () => {
    const api = StravaApi.fromAccessToken(token!!)
    const result = await api.fetchParaglidingActivityIds()
    expect(result.success).toEqual(true)
    if (isSuccess(result)) {
        expect(result.value.length).toEqual(5)
    }
})

test.skip('Test fetchAthlete', async () => {
    const api = StravaApi.fromAccessToken(token!!)

    const athlete = await api.fetchAthlete()

    expect(athlete.firstname).toEqual("Theo")
})