import {getDatabase} from "./database/index";
import {StravaApi} from "./stravaApi";

export default async function (token: string): Promise<void> {

    const api = new StravaApi(token)
    const database = await getDatabase()

    // Fetch profile
    const athlete = await api.fetchAthlete()

    // Save profile to `user` table
    const result = await database.query<UserRow>("INSERT INTO users(user_id,first_name,token) values ($1, $2, $3);",
        [athlete.id, athlete.firstname, token]
    )

    // Fetch activities

    // Insert winged activities to activities

    // Edit recent activities


}