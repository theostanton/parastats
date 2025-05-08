import axios from "axios";
import {Result} from "../model/Result";
import {User} from "../model/User";

const baseUrl = process.env.API_URL;

type BaseResponse = {
    success: boolean
}

type GetSelfResponse = BaseResponse & {
    user: User | undefined
}

export class ParastatsApi {
    token: string

    constructor(token: string) {
        this.token = token
    }

    async getSelf(): Promise<Result<User>> {
        console.log(`helloWorld baseUrl=${baseUrl}`)
        const response = await axios.get<GetSelfResponse>(`http://api:5001`)
        console.log("response.data", JSON.stringify(response.data))
        if (response.status != 200) {
            return [undefined, `Error: ${response.status}`]
        } else if (response.data.user == undefined) {
            return [undefined, `Error: user is undefined`]
        } else {
            return [response.data.user, undefined]
        }
    }
}