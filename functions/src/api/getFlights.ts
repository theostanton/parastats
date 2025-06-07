import {Request, Response} from "express";
import {extractPilotFromJwt} from "@/jwt";
import {Flights} from "@/database/Flights";

export async function getFlights(req: Request, res: Response) {

    console.log("getFlights")
    const pilot = await extractPilotFromJwt(req)
    console.log("getFlights pilot=", pilot)

    const result = await Flights.getAll(pilot.pilot_id)
    console.log("getFlights result=", result)

    if (result.success) {
        const sanitised = JSON.parse(JSON.stringify(result.value, (_, v) =>
            typeof v === "bigint" ? v.toString() : v,
        ))
        res.status(200).json(sanitised);
    } else {
        res.status(400).json({error: result.error})
    }
}