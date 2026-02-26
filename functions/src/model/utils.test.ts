import {expect, test} from "vitest";
import {extractWing} from "./utils";

const cases: [input: string, expected: string | null][] = [
    ["", null],
    ["One\nTwo\nThree", null],
    ["🪂 Example Wing", "Example Wing"],
    ["One\n🪂 Example Wing\nThree", "Example Wing"],
    [" 🪂 Not start of line", null],
    ["🪂 Buzz Z6", "Buzz Z6"],
    ["🪂 Advance Xi 3", "Advance Xi 3"],
    ["🪂 Susi  44 flights / 52h45", "Susi"],
    ["🪂 Buzz Z6  8 flights / 12h30", "Buzz Z6"],
    ["🪂 Advance Xi 3  12 flights / 18h45", "Advance Xi 3"],
]

test.each(cases)('extractWing(\"%s\") = \"%s\"', (input, expected) => {
    const result = extractWing(input)
    expect(result).toEqual(expected)
})
