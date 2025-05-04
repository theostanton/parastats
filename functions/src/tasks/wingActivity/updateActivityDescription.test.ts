import {afterAll, afterEach, beforeAll, beforeEach, expect, it, test} from "vitest";
import {generateContainer} from "../../model/database/generateContainer.test";
import {StartedPostgreSqlContainer} from "@testcontainers/postgresql";
import {end} from "../../model/database/client";
import {ActivityRow, UserRow} from "../../model/database/model";
import {
    AggregationResult,
    formatAggregationResult, generateStats,
    getAllTimeAggregationResult,
    getAllTimeWingAggregationResult,
    getSameYearAggregationResult, updateActivityDescription
} from "./updateActivityDescription";

function randomBigInt(): number {
    return Math.floor(Math.random() * 100000);
}

function randomDistance(): number {
    return Math.floor(Math.random() * 100000)
}

function randomDuration(): number {
    return Math.floor(Math.random() * 100000)
}

let container: StartedPostgreSqlContainer

const userRow1: UserRow = {
    user_id: randomBigInt(),
    first_name: "First",
    token: "token1"
}
const userRow2: UserRow = {
    user_id: randomBigInt(),
    first_name: "Second",
    token: "token2"
}
const user1activity1wing1: ActivityRow = {
    user_id: userRow1.user_id,
    activity_id: randomBigInt(),
    start_date: new Date(10),
    wing: "One",
    description: "🪂 One",
    description_status: "todo",
    distance_meters: randomDistance(),
    duration_sec: 5 * 60
}
const user2activity1wing1: ActivityRow = {
    user_id: userRow2.user_id,
    activity_id: randomBigInt(),
    start_date: new Date(15),
    wing: "One",
    description: "Some description",
    description_status: "todo",
    distance_meters: randomDistance(),
    duration_sec: randomDuration()
}
const user1activity2wing2: ActivityRow = {
    user_id: userRow1.user_id,
    activity_id: randomBigInt(),
    start_date: new Date(20),
    wing: "Two",
    description: "Some description\n🪂 Two",
    description_status: "done",
    distance_meters: randomDistance(),
    duration_sec: 60 * 60
}
const user1activity3wing1: ActivityRow = {
    user_id: userRow1.user_id,
    activity_id: randomBigInt(),
    start_date: new Date(30),
    wing: "One",
    description: "Some description\n🪂 One\nThis wing Xmin over Y flights\nThis year 1h 15min over 3 flights\nAll time 1h 15min over 3 flights\n🌐 parastats.info",
    description_status: "done",
    distance_meters: randomDistance(),
    duration_sec: 10 * 60
}
const user1activity4wing1: ActivityRow = {
    user_id: userRow1.user_id,
    activity_id: randomBigInt(),
    start_date: new Date(40),
    wing: "One",
    description: "Some description",
    description_status: "todo",
    distance_meters: randomDistance(),
    duration_sec: 4 * 60 * 60
}
const user2activity2wing1: ActivityRow = {
    user_id: userRow2.user_id,
    activity_id: randomBigInt(),
    start_date: new Date(50),
    wing: "One",
    description: "Some description",
    description_status: "todo",
    distance_meters: randomDistance(),
    duration_sec: randomDuration()
}

beforeAll(async () => {


    container = await generateContainer(
        [userRow1, userRow2],
        [
            user1activity1wing1,
            user2activity1wing1,
            user1activity2wing2,
            user1activity3wing1,
            user1activity4wing1,
            user2activity2wing1
        ])

})

afterAll(async () => {
    await end()
    await container.stop()
})

//getAllTimeWingAggregationResult()
test('getAllTimeWingAggregationResult() - User 1 Activity 1', async () => {
    const actual = await getAllTimeWingAggregationResult(user1activity1wing1)
    expect(actual.count).toEqual(1)
    expect(actual.total_distance_meters).toEqual(user1activity1wing1.distance_meters)
    expect(actual.total_duration_sec).toEqual(user1activity1wing1.duration_sec)
})

test('getAllTimeWingAggregationResult() - User 1 Activity 2', async () => {
    const actual = await getAllTimeWingAggregationResult(user1activity2wing2)
    expect(actual.count).toEqual(1)
    expect(actual.total_distance_meters).toEqual(user1activity2wing2.distance_meters)
    expect(actual.total_duration_sec).toEqual(user1activity2wing2.duration_sec)
})

test('getAllTimeWingAggregationResult() - User 1 Activity 3', async () => {
    const actual = await getAllTimeWingAggregationResult(user1activity3wing1)
    expect(actual.count).toEqual(2)
    expect(actual.total_distance_meters).toEqual(user1activity1wing1.distance_meters + user1activity3wing1.distance_meters)
    expect(actual.total_duration_sec).toEqual(user1activity1wing1.duration_sec + user1activity3wing1.duration_sec)
})

//getAllTimeAggregationResult()
test('getAllTimeAggregationResult() - User 1 Activity 1', async () => {
    const actual = await getAllTimeAggregationResult(user1activity1wing1)
    expect(actual.count).toEqual(1)
    expect(actual.total_distance_meters).toEqual(user1activity1wing1.distance_meters)
    expect(actual.total_duration_sec).toEqual(user1activity1wing1.duration_sec)
})

test('getAllTimeAggregationResult() - User 1 Activity 2', async () => {
    const actual = await getAllTimeAggregationResult(user1activity2wing2)
    expect(actual.count).toEqual(2)
    expect(actual.total_distance_meters).toEqual(user1activity1wing1.distance_meters + user1activity2wing2.distance_meters)
    expect(actual.total_duration_sec).toEqual(user1activity1wing1.duration_sec + user1activity2wing2.duration_sec)
})

test('getAllTimeAggregationResult() - User 1 Activity 3', async () => {
    const actual = await getAllTimeAggregationResult(user1activity3wing1)
    expect(actual.count).toEqual(3)
    expect(actual.total_distance_meters).toEqual(user1activity1wing1.distance_meters + user1activity2wing2.distance_meters + user1activity3wing1.distance_meters)
    expect(actual.total_duration_sec).toEqual(user1activity1wing1.duration_sec + user1activity2wing2.duration_sec + user1activity3wing1.duration_sec)
})

//getSameYearAggregationResult()
test('getSameYearAggregationResult() - User 1 Activity 1', async () => {
    const actual = await getSameYearAggregationResult(user1activity1wing1)
    expect(actual.count).toEqual(1)
    expect(actual.total_distance_meters).toEqual(user1activity1wing1.distance_meters)
    expect(actual.total_duration_sec).toEqual(user1activity1wing1.duration_sec)
})

test('getSameYearAggregationResult() - User 1 Activity 2', async () => {
    const actual = await getSameYearAggregationResult(user1activity2wing2)
    expect(actual.count).toEqual(2)
    expect(actual.total_distance_meters).toEqual(user1activity1wing1.distance_meters + user1activity2wing2.distance_meters)
    expect(actual.total_duration_sec).toEqual(user1activity1wing1.duration_sec + user1activity2wing2.duration_sec)
})

test('getSameYearAggregationResult() - User 1 Activity 3', async () => {
    const actual = await getSameYearAggregationResult(user1activity3wing1)
    expect(actual.count).toEqual(3)
    expect(actual.total_distance_meters).toEqual(user1activity1wing1.distance_meters + user1activity2wing2.distance_meters + user1activity3wing1.distance_meters)
    expect(actual.total_duration_sec).toEqual(user1activity1wing1.duration_sec + user1activity2wing2.duration_sec + user1activity3wing1.duration_sec)
})

//formatAggregationResult()
test('formatAggregationResult() - 5 mins 1 flight', () => {
    const result: AggregationResult = {
        count: 1,
        total_duration_sec: 60 * 5,
        total_distance_meters: 0
    }
    const actual = formatAggregationResult(result)
    expect(actual).toEqual("5min over 1 flight")
})

test('formatAggregationResult() - 5 mins 2 flights', () => {
    const result: AggregationResult = {
        count: 2,
        total_duration_sec: 60 * 5,
        total_distance_meters: 0
    }
    const actual = formatAggregationResult(result)
    expect(actual).toEqual("5min over 2 flights")
})

test('formatAggregationResult() - 1 hour 5 mins 2 flights', () => {
    const result: AggregationResult = {
        count: 2,
        total_duration_sec: 60 * 60 + 60 * 5,
        total_distance_meters: 0
    }
    const actual = formatAggregationResult(result)
    expect(actual).toEqual("1h 5min over 2 flights")
})

test('formatAggregationResult() - 1 hour 59 mins 2 flights', () => {
    const result: AggregationResult = {
        count: 2,
        total_duration_sec: 60 * 60 + 60 * 59,
        total_distance_meters: 0
    }
    const actual = formatAggregationResult(result)
    expect(actual).toEqual("1h 59min over 2 flights")
})

test('formatAggregationResult() - 2 hours 0min 2 flights', () => {
    const result: AggregationResult = {
        count: 2,
        total_duration_sec: 2 * 60 * 60,
        total_distance_meters: 0
    }
    const actual = formatAggregationResult(result)
    expect(actual).toEqual("2h 0min over 2 flights")
})

test('formatAggregationResult() - 2 hours 45 mins 2 flights', () => {
    const result: AggregationResult = {
        count: 2,
        total_duration_sec: 2 * 60 * 60 + 60 * 45,
        total_distance_meters: 0
    }
    const actual = formatAggregationResult(result)
    expect(actual).toEqual("2h 45min over 2 flights")
})

//generateWingedDescription()
test('generateWingedDescription() - User 1 Activity 1', async () => {
    const actual = await generateStats(user1activity1wing1)
    expect(actual).toEqual("🪂 One\nThis wing 5min over 1 flight\nThis year 5min over 1 flight\nAll time 5min over 1 flight\n🌐 parastats.info")
})

test('generateWingedDescription() - User 1 Activity 2', async () => {
    const actual = await generateStats(user1activity2wing2)
    expect(actual).toEqual("🪂 Two\nThis wing 1h 0min over 1 flight\nThis year 1h 5min over 2 flights\nAll time 1h 5min over 2 flights\n🌐 parastats.info")
})

test('generateWingedDescription() - User 1 Activity 3', async () => {
    const actual = await generateStats(user1activity3wing1)
    expect(actual).toEqual("🪂 One\nThis wing 15min over 2 flights\nThis year 1h 15min over 3 flights\nAll time 1h 15min over 3 flights\n🌐 parastats.info")
})

//generateWingedDescription()
test('updateActivityDescription() - User 1 Activity 1', async () => {
    const actual = await updateActivityDescription(user1activity1wing1.activity_id)
    expect(actual.success).toEqual(true)
    if (actual.success) {
        expect(actual.value).toEqual("🪂 One\nThis wing 5min over 1 flight\nThis year 5min over 1 flight\nAll time 5min over 1 flight\n🌐 parastats.info")
    }
})

test('updateActivityDescription() - User 1 Activity 2', async () => {
    const actual = await updateActivityDescription(user1activity2wing2.activity_id)
    expect(actual.success).toEqual(true)
    if (actual.success) {
        expect(actual.value).toEqual("Some description\n🪂 Two\nThis wing 1h 0min over 1 flight\nThis year 1h 5min over 2 flights\nAll time 1h 5min over 2 flights\n🌐 parastats.info")
    }
})

test('updateActivityDescription() - User 1 Activity 3', async () => {
    const actual = await updateActivityDescription(user1activity3wing1.activity_id)
    expect(actual.success).toEqual(true)
    if (actual.success) {
        expect(actual.value).toEqual("Some description\n🪂 One\nThis wing 15min over 2 flights\nThis year 1h 15min over 3 flights\nAll time 1h 15min over 3 flights\n🌐 parastats.info")
    }
})