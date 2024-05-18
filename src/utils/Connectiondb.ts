import mongoose from "mongoose"
import { InvalidateCacheProps } from "../types/usertypes.js"
import { myCache } from "../app.js"
import { ORdersModel } from "../models/orderSchema.js"
import { Productmodel } from "../models/ProductSchema.js"

export const ConnectionDB = async ()=>{
    await mongoose.connect("mongodb://127.0.0.1:27017"
    ,{
        dbName: "Eccomerce",
    }).then((c)=> console.log(`Connected DB to ${c.connection.host}`)).catch(e=>console.log(`error in connecting ${e}`))
}
 

export const InvalidateCache = async ({product,order,admin,userID,orderID}:InvalidateCacheProps)=>{
   if(product){
      const ProductKeys:string[] = ["latest-product","categories","all-products"];
    // const Products = await Productmodel.find({}).select("_id")
    //   Products.forEach((i)=>{
    //        ProductKeys.push(`product-${i._id}`)
    //   })
      myCache.del(ProductKeys)
   }
   if(order){
    const orderkeys:string[] = ["all-orders",`orders-placed-${userID}`,`single-order-${orderID}`]
    myCache.del(orderkeys)
   }
   if(admin){
     myCache.del(["admin-stats","pie-stats","bar-chart","line-chart"])
   }
}