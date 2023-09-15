import { NextFunction, Request, Response } from "express";
// handle error
export default function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {

	if (res.headersSent) {
		return next()
	}
	res.status(500).json({message: err.message})
	return
}