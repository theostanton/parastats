import {afterAll, afterEach, beforeAll, beforeEach, expect, it, test} from "vitest";
import {TestContainer} from "@parastats/common/generateContainer.test";
import {StartedPostgreSqlContainer} from "@testcontainers/postgresql";
import {end} from "@parastats/common";
import {DescriptionPreference, FlightRow, DescriptionFormatter, withPooledClient} from "@parastats/common";
import {Mocks} from "@parastats/common/Mocks.test";

let container: StartedPostgreSqlContainer

beforeAll(async () => {
    container = await TestContainer.generateFromMocks()
})

afterAll(async () => {
    await end()
    await container.stop()
})


type Input = {
    preference: DescriptionPreference,
    flight: FlightRow,
}

const AllEnabled: DescriptionPreference = {
    pilot_id: Mocks.userRow1.pilot_id,
    include_wing_aggregate: true,
    include_year_aggregate: true,
    include_wind: true,
    include_sites: true,
    include_all_time_aggregate: true
}
const AllDisabled: DescriptionPreference = {
    pilot_id: Mocks.userRow1.pilot_id,
    include_wing_aggregate: false,
    include_year_aggregate: false,
    include_wind: false,
    include_sites: false,
    include_all_time_aggregate: false
}
const cases: [
    title: string,
    input: Input,
    expected: string | null
][] = [

    ["User 1 Activity 1", {flight: Mocks.user1activity1wing1, preference: AllEnabled},
        "🪂 One 1 flight / 5min \n2025 1 flight / 5min\nAll Time 1 flight / 5min\n🌐 paragliderstats.com"],

    ["User 1 Activity 1", {flight: Mocks.user1activity1wing1, preference: {...AllDisabled, include_wind: false}},
        "🪂 One 1 flight / 5min \n2025 1 flight / 5min\nAll Time 1 flight / 5min\n🌐 paragliderstats.com"],

    ["User 1 Activity 1", {flight: Mocks.user1activity1wing1, preference: AllDisabled},
        null],

    ["User 1 Activity 2", {flight: Mocks.user1activity2wing2, preference: AllEnabled},
        "🪂 Two 1 flight / 1h 0min\n2025 2 flights / 1h 5min\nAll Time 2 flights / 1h 5min\n🌐 paragliderstats.com"],

    ["User 1 Activity 3", {flight: Mocks.user1activity3wing1, preference: AllEnabled},
        "🪂 One 2 flights / 15min\n2025 3 flights / 1h 15min\nAll Time 3 flights / 1h 15min\n🌐 paragliderstats.com"],
]

test.each(cases)('generateStats(%s)', async (_, input, expected) => {
    const formatter = new DescriptionFormatter(input.flight, input.preference);
    const actual = await withPooledClient(async (client) => {
        return await formatter.generate(client);
    });
    expect(actual?.replace(/\s/g, '')).toEqual(expected?.replace(/\s/g, ''))
})

