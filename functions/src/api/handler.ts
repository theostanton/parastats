import { Request, Response } from "express";

export default async function handler(req: Request, res: Response): Promise<void> {
    console.log(`API request: ${req.method} ${req.path}`);
    
    // Simple test response
    res.status(200).json({
        status: "OK",
        message: "API is working",
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString()
    });
}