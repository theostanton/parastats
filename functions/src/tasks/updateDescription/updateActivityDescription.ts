import {getDatabase} from "../../model/database/client";
import {FlightRow} from "../../model/database/model";
import {DescriptionFormatter} from "./DescriptionFormatter";
import {ac} from "vitest/dist/chunks/reporters.d.C-cu31ET";


export async function generateStats(activityRow: FlightRow): Promise<string | null> {

    const formatter = await DescriptionFormatter.create(activityRow)

    await formatter.appendTakeOffAndLanding()
    await formatter.appendWingAggregation()
    await formatter.appendSameYearAggregation()
    await formatter.appendAllTimeAggregation()

    return formatter.generate()
}
