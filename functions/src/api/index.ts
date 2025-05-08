import {Request, Response} from "express";
import {getDatabase} from "../model/database/client";

export default async function handler(req: Request, res: Response): Promise<void> {
    console.log("Received api body=", JSON.stringify(req.body));

    const database = await getDatabase();
    console.log(database)
    // const result = await database.query("SELECT * FROM users")
    // console.log(result)
    res.status(200).send({"status": "OK"});
}