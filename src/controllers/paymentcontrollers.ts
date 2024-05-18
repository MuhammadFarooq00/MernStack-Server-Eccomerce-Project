import { myCache, stripe } from "../app.js";
import { TRYCATCH } from "../middleware/errormiddleware.js";
import { Coupon } from "../models/couponmodel.js";
import Errorhandler from "../utils/utility-class.js";

export const PaymentIntent = TRYCATCH(
    async (req,res,next)=>{
        const {amount} = req.body;
        if(!amount){
            return next(new Errorhandler("Please Enter Amount", 404))
        }
        
        const paymentintent = await stripe.paymentIntents.create({
            amount: Number(amount)*100,
            currency: "inr"
        })

        return res.status(201).json({
            success: true,
            clientSecret: paymentintent.client_secret
        })
    }
) 

export const Newcoupn = TRYCATCH(
    async (req,res,next)=>{
        const {coupon,discount} = req.body;
        if(!coupon || !discount){
            return next(new Errorhandler("Please fill both the fields", 404))
        }
        const coupongenerate = await Coupon.create({
            coupon,
            discount,
        })
        return res.status(201).json({
            success: true,
            message: `coupon created ${coupon}`,
        })
    }
) 

export const Applydiscount = TRYCATCH(
    async (req,res,next)=>{
        const {code} = req.query;
        const discountAmount = await Coupon.findOne({coupon: code});
        if(!discountAmount) return next(new Errorhandler("Invalid Coupon Code", 400))
        return res.status(201).json({
            success: true,
            discountAmount: discountAmount.discount,
        })
    }
) 

export const Allcoupons = TRYCATCH(
    async (req,res,next)=>{
        let allcoupons;
        if(myCache.has("all-coupons")) allcoupons= JSON.parse(myCache.get("all-coupons") as string) 
        else{
        allcoupons = await Coupon.find();
        myCache.set("all-coupons",allcoupons)
        }
        return res.status(201).json({
            success: true,
            allcoupons,
        })
    }
) 

export const Deletecoupon = TRYCATCH(
    async (req,res,next)=>{
        const {id} = req.params;
        const findcoupon = await Coupon.findById(id);
        if(!findcoupon) return next(new Errorhandler("Invalid ID! Coupon not found", 404))
        await findcoupon.deleteOne();
        return res.status(201).json({
            success: true,
            message: `coupon ${findcoupon?.coupon} delete successfully`,
        })
    }
) 
