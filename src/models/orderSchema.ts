import mongoose from "mongoose";
import { describe } from "node:test";
import { types } from "util";

const ORder = new mongoose.Schema({
     shippingInfo:{
        address:{
        type:String,
        required: [true, 'Address is Required']
        },
        city:{
            type:String,
            required: [true, 'City name is Required']
        },
        state:{
            type:String,
            required: [true, 'state is Required']
        },
        country:{
            type:String,
            required: [true, 'Country is Required']
        },
        pincode:{
            type: Number,
            required: [true, 'pincode is Required']
        },
     },
     user: {
        // type: mongoose.Types.ObjectId
        type: String,
        // type:mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
     },
     subtotal: {
        type: Number,
        required: true
     },
     tax: {
        type: Number,
        required: true
     },
     shippingCharges: {
        type: Number,
        required: true,
        default: 0
     },
     discount: {
        type: Number,
        required: true,
        default: 0
     },
     total: {
        type: Number,
        required: true
     },
     status:{
        type:String,
        enum: ["processing","shipped","delivered"],
        default: "processing"
    },
    orderItems: [
        {
            name: String,
            photo: String,
            price: Number,
            quantity: Number,
            productID:{
                type: mongoose.Types.ObjectId,
                ref: "product",
            }
        }
    ]

},{
    timestamps: true
});


export const ORdersModel = mongoose.model("order",ORder)