import {FlightRow} from "@/database/model";
import {DescriptionFormatter} from "./DescriptionFormatter";


export async function generateStats(activityRow: FlightRow): Promise<string | null> {

    const formatter = await DescriptionFormatter.create(activityRow)
    return formatter.generate()
}
