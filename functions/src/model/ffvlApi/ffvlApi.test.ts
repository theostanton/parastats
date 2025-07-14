import {isSuccess} from "@parastats/common";
import {expect, test} from "vitest";
import {FFVL} from "./index";

test("FFVL.getReport()", async () => {
    const baliseId = "5026" // Brise vallée de Cham

    const fourHoursAgoMillis = new Date().getTime() - 4 * 60 * 60 * 1000
    const result = await FFVL.getReport(baliseId, new Date(fourHoursAgoMillis))

    if (!isSuccess(result)) {
        console.error(result[1])
    }
    expect(result[0]).toBe(true)
    if (isSuccess(result)) {
        const value = result[0]
        expect(value.windKmh).toBeTypeOf('number')
        expect(value.gustKmh).toBeTypeOf('number')
        expect(value.idbalise).toBeTypeOf('string')
        expect(value.date.getTime()).toBeTypeOf('number')
        expect(value.direction.toString().length).toBeGreaterThan(0)
    }

})