import {expect, it, test} from "vitest";
import {StravaApi} from "./index";

test('Test fetchWingedActivities', async () => {
    const api = new StravaApi("")
})

test('Test fetchWingedActivities', async () => {
    const api = new StravaApi("")

    const athlete = await api.fetchAthlete()

    expect(athlete.firstname).toEqual("Theo")
})