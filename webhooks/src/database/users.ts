import {getDatabase} from "./index";
import {Success, Failed, Result} from "../model";

export namespace users {
    export async function insert(user: UserRow): Promise<void> {
        const database = await getDatabase()
        await database.query("INSERT into users (first_name, token, user_id) values ($1, $2, $3)", [user.first_name, user.token, user.user_id])
    }

    export async function get(userId: number): Promise<Result<UserRow>> {
        const database = await getDatabase()
        const result = await database.query<UserRow>("select first_name, token, user_id from users where user_id = $1", [userId])
        if (result.rows.length === 1) {
            return new Success(result.rows[0].reify())
        } else {
            return new Failed(`No results for userId=${userId}`)
        }
    }

    export async function getToken(userId: number): Promise<Result<string>> {
        const database = await getDatabase()
        const result = await database.query<Pick<UserRow, "token">>("select token from users where user_id = $1", [userId])
        if (result.rows.length === 1) {
            return new Success(result.rows[0].reify().token)
        } else {
            return new Failed(`No results for userId=${userId}`)
        }
    }
}