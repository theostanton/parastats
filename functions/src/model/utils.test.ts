import {expect, test} from "vitest";
import {extractWing} from "./utils";

const cases: [input: string, expected: string | null][] = [
    ["", null],
    ["One\nTwo\nThree", null],
    ["🪂 Example Wing", "Example Wing"],
    ["One\n🪂 Example Wing\nThree", "Example Wing"],
    [" 🪂 Not start of line", null]
]

test.each(cases)('extractWing(\"%s\") = \"%s\"', (input, expected) => {
    const result = extractWing(input)
    expect(result).toEqual(expected)
})
