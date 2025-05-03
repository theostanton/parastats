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
        start_date: new Date(),
    }

    const input = [input1]

    const results = await convertStravaActivities(userId, input)

    expect(results.length).toEqual(1)

    expect(results[0].user_id).toEqual(userId)
    expect(results[0].wing).toEqual("Wing name")
    expect(results[0].activity_id).toEqual(input1.id)
    expect(results[0].duration_sec).toEqual(input1.elapsed_time)
    expect(results[0].distance_meters).toEqual(input1.distance)
})