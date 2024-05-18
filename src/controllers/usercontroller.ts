import { NextFunction, Request, Response } from "express";
import User from "../models/Usermodel.js";
import { NewuserRequestBody } from "../types/usertypes.js";
import { TRYCATCH } from "../middleware/errormiddleware.js";
import Errorhandler from "../utils/utility-class.js";


const Usercontroller = TRYCATCH(
    async (req: Request<{},{},NewuserRequestBody>,res:Response<any>,next:NextFunction)=>{
        
            const {_id,name,photo,email,dob,gender} = req.body;
            
            let user = await User.findById(_id);
            if(user){
                return res.status(200).json({
                    success: true,
                    message: `welcome back ${user.name}`
                })
            }
             if(!_id || !name || !email || !photo || !gender || !dob ){
                 return next(new Errorhandler("Please fill all the fields", 400))
             }
            const usercreated = await User.create({
                _id,
                name,
                email,
                dob: new Date(dob),
                photo,
                gender
            })
           return res.status(201).json({
                success: true,
                message: `Welcome ${usercreated.name}`
            })
    }
);

export default Usercontroller;


export const GetallUser = TRYCATCH(
    async (req:Request<{},{},NewuserRequestBody>,res:Response,next:NextFunction)=>{
         const data = await User.find();
         if(data.length>0){
            return res.status(200).json({
                status: true,
                message: data
            })
         }
        else {
            next(new Errorhandler("No previous stored record of any user", 400))
        }
    }
)

export const GetOneUser = TRYCATCH(
    async (req,res,next)=>{
         const id = req.params.id;
         const userdata = await User.findById(id);
         if(userdata){
            return res.status(200).json({
                status: true,
                message: userdata
            })
         }
        else {
          return next(new Errorhandler("Invalid User Id", 400))
        }
    }
)

export const DeleteUser = TRYCATCH(
    async (req,res,next)=>{
         const id = req.params.id;
         const user = await User.findById(id);
         if(!user){
           return next(new Errorhandler("Invalid User Id check id for deleting this user", 400));
         }
         
         await user.deleteOne();
            return res.status(200).json({
                status: true,
                message: "User deleted successfully"
            })
       
       
    }
)