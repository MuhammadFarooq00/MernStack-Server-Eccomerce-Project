import { NextFunction, Request, Response } from "express";
import { TRYCATCH } from "../middleware/errormiddleware.js";
import { NewOrderRequestBody } from "../types/usertypes.js";
import { ORdersModel } from "../models/orderSchema.js";
import { reduceStock } from "../utils/mainfunctions.js";
import { InvalidateCache } from "../utils/Connectiondb.js";
import Errorhandler from "../utils/utility-class.js";
import { myCache } from "../app.js";


const ORderControllers = TRYCATCH(
    async (req:Request<{},{}, NewOrderRequestBody>,res:Response,next:NextFunction)=>{
    const {shippingInfo,user,subtotal,total,tax,orderItems,shippingCharges,discount} = req.body;
    if(!shippingInfo || !user || !subtotal || !total || !tax || !orderItems){
        return next(new Errorhandler("Please Fill all the field", 400))
    }
    await ORdersModel.create({
      shippingInfo,
        user,
        subtotal, 
        total,
        tax,
        orderItems,
        discount,
        shippingCharges
    });
      await reduceStock(orderItems);
      await InvalidateCache({product:true, order:true, admin:true, userID:user})
      return res.status(201).json({
        success: true,
        message: "order Placed successfully"
      })
    }
)
export default ORderControllers;

export const Myorders = TRYCATCH(
    async (req,res,next)=>{
    let {id:user} = req.query;

    let orders = [];
    if(myCache.has(`orders-placed-${user}`)) orders = JSON.parse(myCache.get(`orders-placed-${user}`) as string)
    else{
        orders = await ORdersModel.find({user});
        myCache.set(`orders-placed-${user}`,JSON.stringify(orders))
    }
    
      return res.status(200).json({
        success: true,
        orders, 
    })
    }
)

export const ALLorders = TRYCATCH(
    async (req,res,next)=>{
    let orders = [];
    if(myCache.has(`all-orders`)) orders = JSON.parse(myCache.get(`all-orders`) as string)
    else{
        orders = await ORdersModel.find().populate("user","name");
        myCache.set(`all-orders`,JSON.stringify(orders))
    }
    
      return res.status(200).json({
        success: true,
        orders, 
    })
    }
)

export const GetSingleORder = TRYCATCH(
    async (req,res,next)=>{
    let {id} = req.params;
    const key = `single-order-${id}`;
    let order;
    if(myCache.has(key)) order = JSON.parse(myCache.get(key) as string)
    else{
        order = await ORdersModel.findById(id).populate("user","name");
        if(!order) return next(new Errorhandler("Order Not Found", 404))
        myCache.set(key,JSON.stringify(order))
    }
    
      return res.status(200).json({
        success: true,
        order, 
    })
    }
)

// .............................. update request

export const GetOrderUpdate = TRYCATCH(
    async (req,res,next)=>{
     const {id} = req.params;
     const order = await ORdersModel.findById(id);
     if(!order) return next(new Errorhandler("Product not found",404))
      switch (order.status) {
        case "processing":
            order.status = "shipped"
            break;
        case "shipped":
            order.status = "delivered"
            break;
        default: order.status = "delivered"
            break;
      }
      await order.save();
      await InvalidateCache({product:false, order:true, admin:true,userID:order.user,orderID:String(order._id)})
      return res.status(200).json({
        success: true,
        message: "order processed successfully"
      })
    }
)

//........................................delete request.............


export const GetOrderdelete = TRYCATCH(
    async (req,res,next)=>{
     const {id} = req.params;
     const order = await ORdersModel.findById(id);
     if(!order) return next(new Errorhandler("Product not found",404))
     await order.deleteOne();
      await InvalidateCache({product:false, order:true, admin:true,userID:order.user,orderID:String(order._id)})
      // await InvalidateCache({ product: false, order: true, admin: true, userID: order.user, orderID: order._id }); chatgpt mara h
      return res.status(200).json({
        success: true,
        message: "order deleted successfully"
      })
    }
)