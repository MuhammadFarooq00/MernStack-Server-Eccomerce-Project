import { NextFunction, Request, Response } from "express";
import Errorhandler from "../utils/utility-class.js";
import { Controllertypes } from "../types/usertypes.js";


export const errorMiddleware = (err: Errorhandler, req: Request,res: Response, next: NextFunction)=>{
    err.message ||= "Internal Server Error";
    err.statuscode ||= 500;
if(err.name === "CastError") err.message = "Invalid ID" 
    return res.status(err.statuscode).json({
       success: false,
       message: err.message
    });
   };
export const TRYCATCH = (func: Controllertypes)=> (req:Request,res:Response,next:NextFunction)=>{
  return Promise.resolve(func(req,res,next)).catch(next);
}
// const a = TRYCATCH();