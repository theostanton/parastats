import {Request, Response} from "express";

export async function getActivity(req: Request, res: Response) {
    res.status(404).send('getActivity');
}