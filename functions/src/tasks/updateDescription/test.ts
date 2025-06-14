import {expect, test} from "vitest";
import handler from "./index";
import {FetchAllActivitiesTask, UpdateDescriptionTask} from "@parastats/common/src/model";

test("updateDescription success", async () => {
    const input: UpdateDescriptionTask = {
        name: "UpdateDescription",
        flightId: "123",
    }
    const result = await handler(input)
    expect(result.success).toEqual(true)
})

test("updateDescription fail on invalid body", async () => {
    const input: FetchAllActivitiesTask = {
        name: "FetchAllActivities",
        pilotId: 123
    }
    const result = await handler(input)
    expect(result.success).toEqual(false)
})