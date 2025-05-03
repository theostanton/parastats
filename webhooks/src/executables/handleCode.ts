import {Request, Response} from "express";
import {StravaAthlete} from "../model/stravaApi/model";
import axios from "axios";
import initialiseUser from "./initialiseUser";

export async function handleCode(req: Request, res: Response) {
    console.log("handleCode code=", req.query['code'])
    type Response = {
        access_token: string,
        athlete: StravaAthlete
    }

    const params = new URLSearchParams({
        client_id: process.env.CLIENT_ID!!.toString(),
        client_secret: process.env.CLIENT_SECRET!!.toString(),
        code: req.query['code']!!.toString(),
        grant_type: "authorization_code"
    }).toString();
    let url = `https://www.strava.com/oauth/token?${params}`;

    const response = await axios.post<Response>(url)

    const body = response.data
    console.log("handleCode body=")
    console.log(body)

    //https://webhooks.parastats.info/?state=&code=dc9f4bba26200268407d872afe1a0e6dd0cbe650&scope=read,activity:write,activity:read_all,read_all

    const result = await initialiseUser(body.access_token)

    res.status(200).send({status: "OK", action: "handleCode", "result": result});
}