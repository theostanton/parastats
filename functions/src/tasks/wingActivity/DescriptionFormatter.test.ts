import {expect, test} from "vitest";
import wingActivity, {WingActivityTask} from "./index";

test("wingActivity success", async () => {
    const input: WingActivityTask = {
        name: "WingActivity",
        flightId: "123",
    }
    const result = await wingActivity(input)
    expect(result.success).toEqual(false)
})