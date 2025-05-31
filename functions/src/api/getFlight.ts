import {Request, Response} from "express";

export async function getFlight(req: Request, res: Response) {
    res.status(404).send('getActivity');
}