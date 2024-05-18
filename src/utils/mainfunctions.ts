import { Document } from "mongoose";
import { Productmodel } from "../models/ProductSchema.js";
import { Orderitemstypes } from "../types/usertypes.js";



export const reduceStock = async(orderitems: Orderitemstypes[])=>{
   for(let i=0;i<orderitems.length;i++){
    const order = orderitems[i];
      const product = await Productmodel.findById(order.productId);
      if(!product) throw new Error("Product not found");
      product.stock -= order.quantity;
      await product.save();
   }
}


export const calculatePercentage = (thismonth:number, lastmonth:number)=>{
   if(lastmonth===0) return thismonth*100;
   //  const percent = ((thismonth-lastmonth) / lastmonth)*100;
   const percent = (thismonth/lastmonth)*100;
    return Number(percent.toFixed(0));
}

export const getInventorycategories = async ({categories,productcount}: {categories: string[]; productcount:number})=>{
   const categoriesCountpromise = categories.map((category)=>Productmodel.countDocuments({category}));
      const categoriesCount = await Promise.all(categoriesCountpromise);
      
      const CategoryCount:Record<string,number>[] = [];
      categories.forEach((category,i)=>{
        CategoryCount.push({
            [category]: Math.round(((categoriesCount[i]/productcount)*100)),
        })
      });
   
   return CategoryCount;
};

interface mydocuments extends Document{
   createdAt: Date,
   discount?: number,
   total?: number,
}

type funcProps = {length:number; docArr:mydocuments[],today:Date; property?:"discount" | "total"}
export const getChartdata = ({length,docArr,today,property}:funcProps)=>{
   const data: number[] = new Array(length).fill(0);
   docArr.forEach((i)=>{
      const creationDate = i.createdAt;
      const diffmonth = (today.getMonth() - creationDate.getMonth()+12)%12;
      if(diffmonth < length){
        data[length-diffmonth-1] += property? i[property]! : 1;
      }
    })
    return data;
}