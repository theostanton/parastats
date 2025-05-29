import {Request, Response} from "express";
import {extractUserFromJwt} from "../jwt";
import {Activities} from "../model/database/activities";

export async function getActivities(req: Request, res: Response) {

    console.log("getActivities")
    const user = await extractUserFromJwt(req)
    console.log("getActivities user=", user)

    const result = await Activities.getAll(user.user_id)
    console.log("getActivities result=", result)

    if (result.success) {
        const sanitised = JSON.parse(JSON.stringify(result.value, (_, v) =>
            typeof v === "bigint" ? v.toString() : v,
        ))
        res.status(200).json(sanitised);
    } else {
        res.status(400).json({error: result.error})
    }
}