import {FlightRow, SiteType} from "../../model/database/model";
import {getDatabase} from "../../model/database/client";
import {Client} from "ts-postgres";
import {FFVL} from "../../model/ffvlApi";
import {WindDirection} from "../../model/ffvlApi/model";

export type AggregationResult = {
    count: number
    total_duration_sec: number
    total_distance_meters: number
}

export class DescriptionFormatter {

    private lines: string[] = []
    private readonly maxLength: number;
    private wingPrefix: string;
    private yearPrefix: string;
    private allTimePrefix: string;

    static async create(flightRow: FlightRow) {
        const client = await getDatabase()
        return new DescriptionFormatter(client, flightRow)
    }

    private constructor(private client: Client, private flightRow: FlightRow) {
        this.client = client

        this.allTimePrefix = 'All Time'
        this.wingPrefix = `🪂 ${this.flightRow.wing}`
        this.yearPrefix = this.flightRow.start_date.getFullYear().toString()
        this.maxLength = 2 + Math.max(this.wingPrefix.length, this.yearPrefix.length, this.allTimePrefix.length)
    }

    async appendWingAggregation() {
        const result = await this.client.query<AggregationResult>(`
            select count(1)::int               as count,
                   sum(duration_sec)::float    as total_duration_sec,
                   sum(distance_meters)::float as total_distance_meters
            from flights
            where pilot_id = $1
              and wing = $2
              and start_date <= $3
        `, [this.flightRow.pilot_id, this.flightRow.wing, this.flightRow.start_date])

        const values = result.rows[0].reify()

        this.lines.push(`${this.wingPrefix.padEnd(this.maxLength, " ")}${formatAggregationResult(values)}`)
    }

    async generateTakeoffLandingLine(siteType: SiteType, siteName: string, baliseId: string | undefined): Promise<string> {

        const prefix = siteType == SiteType.takeoff ? "↗️" : "↘️"
        const date = siteType == SiteType.takeoff ? this.flightRow.start_date : this.flightRow.start_date

        if (baliseId) {
            const result = await FFVL.getReport(baliseId, date)

            if (result.success) {
                const report = result.value
                return `${prefix} ${siteName} ${report.windKmh}kmh/${report.gustKmh}kmh ${WindDirection[report.direction]}`
            }
        }

        return `${prefix} ${siteName}`
    }

    async appendTakeOffAndLanding() {

        type Row = {
            landing_name: string,
            landing_balise_id: string | undefined,
            takeoff_name: string,
            takeoff_balise_id: string | undefined
        }
        const result = await this.client.query<Row>(`
            select t.name              as takeoff_name,
                   t.nearest_balise_id as takeoff_balise_id,
                   l.name              as landing_name,
                   l.nearest_balise_id as landing_balise_id
            from flights as f
                     inner join sites as t on f.takeoff_id = t.ffvl_sid
                     inner join sites as l on f.landing_id = l.ffvl_sid
            where strava_activity_id = $1
        `, [this.flightRow.strava_activity_id])

        const row = result.rows[0].reify()

        const takeoffLine = await this.generateTakeoffLandingLine(SiteType.takeoff, row.takeoff_name, row.takeoff_balise_id)
        this.lines.push(takeoffLine)

        const landingLine = await this.generateTakeoffLandingLine(SiteType.landing, row.landing_name, row.landing_balise_id)
        this.lines.push(landingLine)
    }

    async appendSameYearAggregation() {
        const result = await this.client.query<AggregationResult>(`
            select count(1)::int               as count,
                   sum(duration_sec)::float    as total_duration_sec,
                   sum(distance_meters)::float as total_distance_meters
            from flights
            where pilot_id = $1
              and start_date <= $2
              and date_part('year', start_date) = date_part('year', $2)
        `, [this.flightRow.pilot_id, this.flightRow.start_date])

        const values = result.rows[0].reify()

        this.lines.push(`${this.yearPrefix.padEnd(this.maxLength, " ")}  ${formatAggregationResult(values)}`)
    }

    async appendAllTimeAggregation() {
        const result = await this.client.query<AggregationResult>(`
            select count(1)::int               as count,
                   sum(duration_sec)::float    as total_duration_sec,
                   sum(distance_meters)::float as total_distance_meters
            from flights
            where pilot_id = $1
              and start_date <= $2
        `, [this.flightRow.pilot_id, this.flightRow.start_date])

        const values = result.rows[0].reify()

        this.lines.push(`${this.allTimePrefix.padEnd(this.maxLength, " ")}  ${formatAggregationResult(values)}`)
    }

    generate(): string | null {
        if (this.lines.length > 0) {
            return [...this.lines, '🌐 parastats.info'].join('\n')
        }
        return null;
    }
}


function formatAggregationResult(result: AggregationResult): string {
    return `${result.count} ${result.count == 1 ? "flight" : "flights"} / ${elapsedTime(result.total_duration_sec)}`
}

function elapsedTime(duration_secs: number): string {
    if (duration_secs >= 60 * 60) {
        const hours = Math.floor(duration_secs / (60 * 60))
        const minutes = Math.floor((duration_secs - hours * 60 * 60) / 60)
        return `${hours}h ${minutes}min`
    }
    const hours = Math.floor(duration_secs / (60 * 60))
    const minutes = Math.floor((duration_secs - 60 * 60 * hours) / 60)
    return `${minutes}min`
}