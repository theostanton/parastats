import {expect, test} from "vitest";
import wingActivity from "./index";
import {FetchAllActivitiesTask, WingActivityTask} from "../model";

test("wingActivity success", async () => {
    const input: WingActivityTask = {
        name: "WingActivity",
        flightId: "123",
    }
    const result = await wingActivity(input)
    expect(result.success).toEqual(true)
})

test("wingActivity fail on invalid body", async () => {
    const input: FetchAllActivitiesTask = {
        name: "FetchAllActivities",
        pilotId: 123
    }
    const result = await wingActivity(input)
    expect(result.success).toEqual(false)
})