import {expect, test} from "vitest";
import handler,{WingActivityTask} from "./index";
import {FetchAllActivitiesTask} from "../fetchAllActivities";

test("wingActivity success", async () => {
    const input: WingActivityTask = {
        name: "WingActivity",
        flightId: "123",
    }
    const result = await handler(input)
    expect(result.success).toEqual(true)
})

test("wingActivity fail on invalid body", async () => {
    const input: FetchAllActivitiesTask = {
        name: "FetchAllActivities",
        pilotId: 123
    }
    const result = await handler(input)
    expect(result.success).toEqual(false)
})