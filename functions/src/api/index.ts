import {Request, Response} from "express";
import {getDatabase} from "../model/database/client";
import {UserRow} from "../model/database/model";

export default async function handler(req: Request, res: Response): Promise<void> {
    console.log("Received api body=", JSON.stringify(req.body));
    const database = await getDatabase();
    const result = await database.query<UserRow>("SELECT * FROM users")
    const users = [...result];

    if (users.length == 1) {
        res.status(200).send({"status": "OK", user: users[0]});
    } else {
        res.status(200).send({"status": "OK"});
    }
}