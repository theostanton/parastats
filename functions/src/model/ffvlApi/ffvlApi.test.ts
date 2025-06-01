import {expect, test} from "vitest";
import {FFVL} from "./index";

test("FFVL.getReport()", async () => {
    const baliseId = "5026" // Brise vallée de Cham

    const fourHoursAgoMillis = new Date().getTime() - 4 * 60 * 60 * 1000
    const result = await FFVL.getReport(baliseId, new Date(fourHoursAgoMillis))

    if (!result.success) {
        console.error(result.error)
    }
    expect(result.success).toBe(true)
    if (result.success) {
        const value = result.value
        expect(value.windKmh).toBeTypeOf('number')
        expect(value.gustKmh).toBeTypeOf('number')
        expect(value.idbalise).toBeTypeOf('string')
        expect(value.date.getTime()).toBeTypeOf('number')
        expect(value.direction.toString().length).toBeGreaterThan(0)
    }
})