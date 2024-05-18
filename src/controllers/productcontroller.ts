import { NextFunction, Request, Response } from "express";
import { TRYCATCH } from "../middleware/errormiddleware.js";
import { Basequery, NewProductRequestBody, SearchQueryRequest } from "../types/usertypes.js";
import { Productmodel } from "../models/ProductSchema.js";
import Errorhandler from "../utils/utility-class.js";
import { rm } from "fs";
import {faker} from "@faker-js/faker";
import { myCache } from "../app.js";
import { InvalidateCache } from "../utils/Connectiondb.js";

export const productController = TRYCATCH(
    async (req:Request<{},{},NewProductRequestBody>,res:Response,next:NextFunction)=>{
      
        const {name,price,stock,category} = req.body;
        const photo = req.file;
         
        if(!photo){
            return next(new Errorhandler("Please add Image",400));
        }
        if(!name || !price || !stock || !category){
            rm(photo.path,()=>{
                console.log("deleted successfully")
            })
            return next(new Errorhandler("Please fill all the fields",400))
        }

        await Productmodel.create({
            name,
            photo:photo?.path,
            stock,
            price,
            category: category.toLowerCase()
        })

        await InvalidateCache({product: true,admin:true})
       
        return res.status(201).json({
            success: true,
            message: "Product Successfully added"
        })
    }
)

export const Getlatestproduct = TRYCATCH(
    async (req:Request<{},{},NewProductRequestBody>,res:Response,next:NextFunction)=>{
        let products = [];
        if(myCache.has("latest-product")) products = JSON.parse(myCache.get("latest-product") as string)
        else{
             products = await Productmodel.find({}).sort({createdAt: -1}).limit(5)
             myCache.set("latest-product",JSON.stringify(products))
        }

        return res.status(201).json({
        success: true,
        message: products
        })
    }
)

export const Getallcategories = TRYCATCH(
    async (req:Request<{},{},NewProductRequestBody>,res:Response,next:NextFunction)=>{
       
        let categories;
        if(myCache.has("categories")) categories = JSON.parse(myCache.get("categories") as string)
        else{
         categories = await Productmodel.distinct("category");
         myCache.set("categories",JSON.stringify(categories));
        }

        // categories = await Productmodel.find({}, {_id: 0, category: 1})
        // const categories = await Productmodel.distinct("category")
        return res.status(201).json({
            success: true,
            message: categories
        })
    }
)


export const GetallProductsAdmin = TRYCATCH(
    async (req,res,next)=>{
        let products;
        if(myCache.has("all-products")) products = JSON.parse(myCache.get("all-products") as string)
        else{
         products =  await Productmodel.find({});
         myCache.set("all-products",JSON.stringify(products));
        }
        
        // console.log(products)
        // const categories = await Productmodel.distinct("category")
        return res.status(201).json({
            success: true,
            message: products
        })
    }
)



export const Getsingleproduct = TRYCATCH(
    // is ko b cache kr sakte h bas key k sath template literals m id bhejni pre gi
    async (req,res:Response,next:NextFunction)=>{
        const id = req.params.id;
        const singleproduct = await Productmodel.findById(id);
        if(!singleproduct){
            return next(new Errorhandler("Product not found",400));
        }
        return res.status(201).json({
            success: true,
            message: singleproduct
        })
    }
)


export const GetSingleUpdate = TRYCATCH(
    async (req,res,next)=>{
        const id = req.params.id;
        const {name,price,stock,category} = req.body;
        const photo = req.file;
        const productupdate = await Productmodel.findById(id);
        // const singleproduct = await Productmodel.findOneAndUpdate({_id:id},{$set:{
        //     name: name,
        //     photo: photo,
        //     price: price,
        //     stock: stock,
        //     category: category
        // }});
        if(!productupdate){
            return next(new Errorhandler("Product not found",400));
        }
        if(photo){
            rm(productupdate.photo!,()=>{
                console.log("old photo deleted successfully")
            })
            productupdate.photo = photo.path;
        }
        if(productupdate.name) productupdate.name=name;
        if(productupdate.price) productupdate.price=price;
        if(productupdate.stock) productupdate.stock=stock;
        if(productupdate.category) productupdate.category=category;

        await productupdate.save();
        await InvalidateCache({product: true,admin:true})

        return res.status(200).json({
            success: true,
            message: "Product updated successfully"
        })
    }
)


export const GetsinglePRoductdelete = TRYCATCH(
    async (req,res:Response,next:NextFunction)=>{
        const id = req.params.id;
        const product = await Productmodel.findById(id);
        if(!product){
            return next(new Errorhandler("Product not found",400));
        }
        rm(product.photo!,()=>{
            console.log("photo deleted successfully")
        })
        
        await product.deleteOne();
        await InvalidateCache({product: true})
        
         return res.status(201).json({
            success: true,
            message: "product deleted successfully"
        })
    })

    export const GetallProducts = TRYCATCH(
        async (req:Request<{},{},{}, SearchQueryRequest>,res,next)=>{

        const {search, sort, category,price} = req.query;
        const page = Number(req.query.page) || 1;
        const limit = Number(process.env.Product_per_page) || 8;
        const skip = (page-1)*limit;
        const Basequery:Basequery = {};
        if(search){
            Basequery.name = {
                $regex: search,
                $options: "i",
            }
        }
        if(price){
            Basequery.price = {
                $lte: Number(price),
            }
        }
        if(category) Basequery.category = category;
        const [products, filterdOnly] = await Promise.all([
        Productmodel.find(Basequery).sort(sort && {price:sort==="asc"? 1 : -1}).limit(limit).skip(skip),
        Productmodel.find(Basequery)
        ])
        // const products = await Productmodel.find(Basequery).sort(sort && {price:sort==="asc"? 1 : -1}).limit(limit).skip(skip);
        // const filterdOnly = await Productmodel.find(Basequery)
        const totalpage = Math.ceil(filterdOnly.length/limit)
            return res.status(201).json({
                success: true,
                products,
                totalpage
            })
        }
    )

//..........................................................................

    // const generateRandomproducts= async (count:number= 10)=>{
    //    const products = [];
    //    for(let i=0; i<count;i++){
    //       const product = {
    //         name: faker.commerce.productName(),
    //         photo: 'uploads\\fa7fe55c-52be-4802-9ab0-4ba472f25374.jpg',
    //         price: faker.commerce.price({min: 500,max: 830000, dec:0}),
    //         stock: faker.commerce.price({min: 0,max: 100, dec:0}),
    //         category: faker.commerce.department(),
    //         createdAt: new Date(faker.date.past()),
    //         updatedAt: new Date(faker.date.recent()),
    //         _v: 0
    //       } 
    //       products.push(product);
    //    }
    //    await Productmodel.create(products);
    //    console.log({success: true})
    // }

//  generateRandomproducts(40);

//..........................................................................

// const Deleterandomlyaddedproduct = async (count:number= 10)=>{
//      const products = await Productmodel.find({}).skip(2);
//     for(let i=0; i< products.length; i++){
//         const product = products[i];
//         await product.deleteOne();
//     }
//     console.log({success: true})
// }

// Deleterandomlyaddedproduct(57);