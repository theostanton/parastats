import {FlightRow} from "@parastats/common";
import {DescriptionFormatter} from "./DescriptionFormatterAdapter";


export async function generateStats(activityRow: FlightRow): Promise<string | null> {
    return DescriptionFormatter.generateDescription(activityRow);
}
