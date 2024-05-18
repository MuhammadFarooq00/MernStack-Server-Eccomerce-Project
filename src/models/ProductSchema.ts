import mongoose from "mongoose";

const Product = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add name"]
    },
    photo: {
        type: String,
        required: [true, "Please add photo"]
    },
    price: {
        type: Number,
        required: [true, "Please add Price"]
    },
    stock: {
        type: Number,
        required: [true, "Please add stock"]
    },
    category: {
        type: String,
        required: [true, "Please add Product category"],
        trim: true
    },
},{
    timestamps: true
})

export const Productmodel = mongoose.model("product",Product)