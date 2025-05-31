import {afterAll, afterEach, beforeAll, beforeEach, expect, it, test} from "vitest";
import {TestContainer} from "../../model/database/generateContainer.test";
import {StartedPostgreSqlContainer} from "@testcontainers/postgresql";
import {end} from "../../model/database/client";
import {FlightRow} from "../../model/database/model";
import {generateStats} from "./updateActivityDescription";
import {Mocks} from "../../model/database/Mocks.test";

let container: StartedPostgreSqlContainer

beforeAll(async () => {
    container = await TestContainer.generateFromMocks()
})

afterAll(async () => {
    await end()
    await container.stop()
})


const cases: [title: string, input: FlightRow, expected: string][] = [
    ["User 1 Activity 1", Mocks.user1activity1wing1, "🪂 One 1 flight / 5min \n2025 1 flight / 5min\nAll Time 1 flight / 5min\n🌐 parastats.info"],
    ["User 1 Activity 2", Mocks.user1activity2wing2, "🪂 Two 1 flight / 1h 0min\n2025 2 flights / 1h 5min\nAll Time 2 flights / 1h 5min\n🌐 parastats.info"],
    ["User 1 Activity 3", Mocks.user1activity3wing1, "🪂 One 2 flights / 15min\n2025 3 flights / 1h 15min\nAll Time 3 flights / 1h 15min\n🌐 parastats.info"],
]

test.each(cases)('generateStats(%s)', async (_, input, expected) => {
    const actual = await generateStats(input)
    expect(actual?.replace(/\s/g, '')).toEqual(expected.replace(/\s/g, ''))
})

