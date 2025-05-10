import {expect, test} from "vitest";
import {FetchAllActivitiesTask, WingActivityTask} from "../model";
import initialiseUser from "./index";

test("fetchAllActivities success", async () => {
    const input: FetchAllActivitiesTask = {
        name: "FetchAllActivities",
        userId: 123,
    }
    const result = await initialiseUser(input)
    expect(result.success).toEqual(false)
})