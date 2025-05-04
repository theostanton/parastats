import {expect, test} from "vitest";
import trigger from "./trigger";
import {WingActivityTask} from "./model";

test.runIf(process.env.CI)('trigger WingActivity task', async () => {
    const input: WingActivityTask = {
        name: "WingActivity",
        activityId: 11641844234
    }
    const result = await trigger(input)
    expect(result.success).toBe(true)
})