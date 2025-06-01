import {expect, test} from "vitest";
import initialiseUser, {FetchAllActivitiesTask} from "./index";
import {UpdateDescriptionTask} from "../updateDescription";

test("fetchAllActivities success", async () => {
    const input: FetchAllActivitiesTask = {
        name: "FetchAllActivities",
        pilotId: 123,
    }
    const result = await initialiseUser(input)
    expect(result.success).toEqual(true)
})

test("updateDescription fail on invalid body", async () => {
    const input: UpdateDescriptionTask = {
        name: "UpdateDescription",
        flightId: "123"
    }
    const result = await initialiseUser(input)
    expect(result.success).toEqual(false)
})