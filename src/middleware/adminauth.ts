import User from "../models/Usermodel.js";
import Errorhandler from "../utils/utility-class.js";
import { TRYCATCH } from "./errormiddleware.js";


export const Adminonly = TRYCATCH(
    async(req,res,next)=>{
         const {id} = req.query;
         if(!id){
            return next(new Errorhandler("Make Sure you are login first", 401))
         }
         const user = await User.findById(id);
         if(!user){
            return next(new Errorhandler("Invalid ID", 401))
         }
         if(user.role !== "admin"){
            return next(new Errorhandler("You can not access this page", 401))
         }
         next();
    }
)