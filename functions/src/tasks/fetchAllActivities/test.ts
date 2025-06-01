import {expect, test} from "vitest";
import initialiseUser, {FetchAllActivitiesTask} from "./index";
import {WingActivityTask} from "../wingActivity";

test("fetchAllActivities success", async () => {
    const input: FetchAllActivitiesTask = {
        name: "FetchAllActivities",
        pilotId: 123,
    }
    const result = await initialiseUser(input)
    expect(result.success).toEqual(true)
})

test("fetchAllActivities fail on invalid body", async () => {
    const input: WingActivityTask = {
        name: "WingActivity",
        flightId: "123"
    }
    const result = await initialiseUser(input)
    expect(result.success).toEqual(false)
})