import {test, expect} from "vitest";
import {StravaActivity} from "../model/stravaApi/model";
import {convertStravaActivities} from "./initialiseUser";

test('Test convertStravaActivities() ', async () => {

    const userId: number = Math.random()

    const input1: StravaActivity = {
        id: Math.random(),
        name: "Theo",
        distance: Math.random(),
        type: "AlpineSki",
        description: "Line one\n🪂 Wing name\nLine two",
        moving_time: Math.random(),
        elapsed_time: Math.random(),
        start_date: new Date(Math.random()),
    }

    const input = [input1]

    const results = convertStravaActivities(userId, input)

    expect(results.length).toEqual(1)

    expect(results[0].user_id).toEqual(userId)
    expect(results[0].wing).toEqual("Wing name")
    expect(results[0].activity_id).toEqual(input1.id)
    expect(results[0].duration_sec).toEqual(input1.elapsed_time)
    expect(results[0].distance_meters).toEqual(input1.distance)
    expect(results[0].start_date).toEqual(input1.start_date)
    expect(results[0].description).toEqual(input1.description)
    expect(results[0].description_status).toEqual("todo")
})