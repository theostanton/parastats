import {expect, test} from "vitest";
import {extractWing} from "./utils";

const cases: [string, string | null][] = []

cases.push(["", null])
cases.push(["One\nTwo\nThree", null])
cases.push(["🪂 Example Wing", "Example Wing"])
cases.push(["One\n🪂 Example Wing\nThree", "Example Wing"])
cases.push([" 🪂 Not start of line", null])

test.each(cases)('extractWing(%s) = %s', (input, expected) => {
    const result = extractWing(input)
    expect(result).toEqual(expected)
})
