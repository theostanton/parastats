import {expect, test} from "vitest";
import {StravaActivity} from "../../model/stravaApi/model";
import {convertStravaActivity} from "./convertStravaActivities";

test('Test convertStravaActivities() ', async () => {

    const userId: number = Math.random()

    const input: StravaActivity = {
        id: Math.random(),
        name: "Theo",
        distance: Math.random(),
        type: "AlpineSki",
        description: "Line one\n🪂 Wing name\nLine two",
        moving_time: Math.random(),
        elapsed_time: Math.random(),
        start_date: new Date(Math.random()),
    }


    const result = convertStravaActivity(userId, input)
    
    expect(result.user_id).toEqual(userId)
    expect(result.wing).toEqual("Wing name")
    expect(result.activity_id).toEqual(input.id)
    expect(result.duration_sec).toEqual(input.elapsed_time)
    expect(result.distance_meters).toEqual(input.distance)
    expect(result.start_date).toEqual(input.start_date)
    expect(result.description).toEqual(input.description)
    expect(result.description_status).toEqual("todo")
})