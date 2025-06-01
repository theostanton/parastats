import {PostgreSqlContainer, StartedPostgreSqlContainer} from "@testcontainers/postgresql";
import {connect} from "ts-postgres";
import {setClient} from "./client";
import {FlightRow, PilotRowFull, Site} from "./model";
import {Pilots} from "./Pilots";
import {test} from "vitest";
import {Flights} from "./Flights";
import * as fs from "node:fs";
import {Mocks} from "./Mocks.test";
import {Sites} from "./Sites";


export namespace TestContainer {

    export async function generateEmpty(): Promise<StartedPostgreSqlContainer> {
        return generateContainer()
    }

    export async function generateFromMocks(): Promise<StartedPostgreSqlContainer> {
        return generateContainer(
            [Mocks.userRow1, Mocks.userRow2],
            [
                Mocks.user1activity1wing1,
                Mocks.user2activity1wing1,
                Mocks.user1activity2wing2,
                Mocks.user1activity3wing1,
                Mocks.user1activity4wing1,
                Mocks.user2activity2wing1
            ],
            [
                Mocks.planpraz,
                Mocks.forclaz,
                Mocks.leSavoy,
                Mocks.planpraz
            ],
        )

    }

    export async function generateCustom(pilots: PilotRowFull[] = [],
                                         flights: FlightRow[] = [],
                                         sites: Site[] = []
    ): Promise<StartedPostgreSqlContainer> {
        return generateCustom(pilots, flights, sites)
    }

    async function generateContainer(
        pilots: PilotRowFull[] = [],
        flights: FlightRow[] = [],
        sites: Site[] = []
    ): Promise<StartedPostgreSqlContainer> {

        const container = await new PostgreSqlContainer("postgres")
            .start();

        console.log(`port=${container.getPort()}`)
        const client = await connect({
            host: container.getHost(),
            database: container.getDatabase(),
            user: container.getUsername(),
            password: container.getPassword(),
            port: container.getPort(),
        })

        const scriptsDir = './src/model/database/scripts/';
        const createFlightsSql = fs.readFileSync(scriptsDir + 'create_flights.sql', 'utf8');
        const createPilotsSql = fs.readFileSync(scriptsDir + 'create_pilots.sql', 'utf8');
        const createTakeoffsLandingsSql = fs.readFileSync(scriptsDir + 'create_takeoffs_landings.sql', 'utf8');


        const queries: string[] = [
            ...createFlightsSql.split(";;;"),
            ...createPilotsSql.split(";;;"),
            ...createTakeoffsLandingsSql.split(";;;"),
        ]

        for await (const query of queries) {
            try {
                await client.query(query)
            } catch (error) {
                console.error(`Failed to execute query: ${query}`);
                throw error
            }
        }

        setClient(client)

        for (const pilot of pilots) {
            await Pilots.insert(pilot);
        }
        const flightsResult = await Flights.upsert(flights)
        if (flightsResult.success == false) {
            throw new Error(`Failed to upsert flights error=${flightsResult.error}`);
        }
        await Sites.upsert(sites)

        return container
    }
}


test("generateEmpty()", async () => {
    await TestContainer.generateEmpty()
})

test("generateFromMocks()", async () => {
    await TestContainer.generateFromMocks()
})