import {expect, test} from "vitest";
import wingActivity from "./index";
import {FetchAllActivitiesTask, WingActivityTask} from "../model";

test("wingActivity success", async () => {
    const input: WingActivityTask = {
        name: "WingActivity",
        flightId: "123",
    }
    const result = await wingActivity(input)
    expect(result.success).toEqual(false)
})