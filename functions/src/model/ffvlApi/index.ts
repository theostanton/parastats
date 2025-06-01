import {FfvlReport, WindDirection, WindsockReport} from "./model";
import {Result} from "../model";
import axios from "axios";

export namespace FFVL {

    export const BaseUrl = "https://data.ffvl.fr/api"

    const Half = 45 / 2
    const NorthDegrees = 0
    const NorthEastDegrees = 45
    const EastDegrees = 90
    const SouthEastDegrees = 135
    const SouthDegrees = 180
    const SouthWestDegrees = 225
    const WestDegrees = 270
    const NorthWestDegrees = 315

    function convertToWindsockDirection(degrees: number): WindDirection {
        if (degrees < NorthDegrees + Half) {
            return WindDirection.N
        }
        if (degrees < NorthEastDegrees + Half) {
            return WindDirection.NE
        }
        if (degrees < EastDegrees + Half) {
            return WindDirection.E
        }
        if (degrees < SouthEastDegrees + Half) {
            return WindDirection.SE
        }
        if (degrees < SouthDegrees + Half) {
            return WindDirection.S
        }
        if (degrees < SouthWestDegrees + Half) {
            return WindDirection.SW
        }
        if (degrees < WestDegrees + Half) {
            return WindDirection.W
        }
        if (degrees < NorthWestDegrees + Half) {
            return WindDirection.NW
        }
        return WindDirection.N
    }

    function convertToWindsockReport(ffvlReport: FfvlReport): WindsockReport {
        const direction = parseInt(ffvlReport.directVentMoy)
        const date = new Date(ffvlReport.date)
        return {
            idbalise: ffvlReport.idbalise,
            windKmh: parseInt(ffvlReport.vitesseVentMin),
            gustKmh: parseInt(ffvlReport.vitesseVentMax),
            direction: convertToWindsockDirection(direction),
            date,
        }
    }

    export async function getReport(baliseId: string, date: Date): Promise<Result<WindsockReport>> {

        const now = new Date()
        const hours = (now.getTime() - date.getTime()) / (60 * 60 * 1000);

        if (hours > 72) {
            return {
                success: false,
                error: `Flight was too many hours ago hours=${hours}`
            }
        }

        const response = await axios.get<FfvlReport[]>(BaseUrl, {
            params: {
                base: "balises",
                idbalise: baliseId,
                r: "histo",
                hours: Math.max(72, hours + 5),
                mode: "json",
                key: process.env.FFVL_KEY
            }
        })

        let closest: [FfvlReport, number] | null = null
        for (const report of response.data) {
            const reportDate = new Date(report.date)
            const diffMillis = Math.abs(reportDate.getTime() - date.getTime())
            if (diffMillis < 30 * 60 * 1000 && (closest == null || diffMillis < closest[1])) {
                closest = [report, diffMillis]
            }
        }

        if (closest == null) {
            return {
                success: false,
                error: "Couldn't get a close enough report"
            }
        }

        const value = convertToWindsockReport(closest[0])
        return {
            success: true,
            value
        }
    }
}
export {FfvlSite} from "./model";
export {FfvlBalise} from "./model";