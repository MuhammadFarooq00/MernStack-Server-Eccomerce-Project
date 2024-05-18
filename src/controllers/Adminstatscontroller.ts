// import { Promise } from "mongoose";
import { myCache } from "../app.js";
import { TRYCATCH } from "../middleware/errormiddleware.js";
import { Productmodel } from "../models/ProductSchema.js";
import User from "../models/Usermodel.js";
import { ORdersModel } from "../models/orderSchema.js";
import { calculatePercentage,  getChartdata,  getInventorycategories } from "../utils/mainfunctions.js";


export const getAdminDashboard = TRYCATCH(
    async (req,res,next)=>{
      let stats={};
      if(myCache.has("admin-stats")) stats = JSON.parse(myCache.get("admin-stats") as string)
      else{
      const today = new Date();
      const sixmonthago = new Date();
      sixmonthago.setMonth(sixmonthago.getMonth()-6);

      const startofthismonth = new Date(today.getFullYear(),today.getMonth(),1);
      const endofthismonth = today;
      const startoflastmonth = new Date(today.getFullYear(),today.getMonth()-1,1);
      const endoflastmonth = new Date(today.getFullYear(),today.getMonth(),0);
      
      const thismonthproductspromise = Productmodel.find({
        createdAt: {$gte: startofthismonth,$lte: endofthismonth}
      })
      const lastmonthproductspromise = Productmodel.find({
        createdAt: {$gte: startoflastmonth,$lte: endoflastmonth}
      })
      const thismonthuserspromise = User.find({
        createdAt: {$gte: startofthismonth,$lte: endofthismonth}
      })
      const lastmonthuserspromise = User.find({
        createdAt: {$gte: startoflastmonth,$lte: endoflastmonth}
      })
      const thismonthorderspromise = ORdersModel.find({
        createdAt: {$gte: startofthismonth,$lte: endofthismonth}
      })
      const lastmonthorderspromise = ORdersModel.find({
        createdAt: {$gte: startoflastmonth,$lte: endoflastmonth}
      })
      const lastsixmonthsorderspromise = ORdersModel.find({
        createdAt: {$gte: sixmonthago,$lte: today}
      })

      const latestTransactionPromise = ORdersModel.find({}).select(["orderItems","discount","total","status"]).limit(4);
       
      const [thismonthproducts,lastmonthproducts,thismonthuser,lastmonthsuser,thismonthorders,lastmonthsorder,productcount,usercount,allorders,lastsixmonthsorders,categories,femaleUserCount,latestTransaction] = await Promise.all([
        thismonthproductspromise,
        lastmonthproductspromise,
        thismonthuserspromise,
        lastmonthuserspromise,
        thismonthorderspromise,
        lastmonthorderspromise,
        Productmodel.countDocuments(),
        User.countDocuments(),
        ORdersModel.find({}).select("total"),
        lastsixmonthsorderspromise,
        Productmodel.distinct("category"),
        User.countDocuments({gender: "female"}),
        latestTransactionPromise
      ])

      const thismonthrevenue = thismonthorders.reduce(
        (total,order) => total + (order.total || 0),0
      );
      const lastmonthrevenue = lastmonthsorder.reduce(
        (total,order) => total + (order.total || 0),0
      )

      const userChangepercentage = calculatePercentage(thismonthuser.length,lastmonthsuser.length)
      const orderChangepercentage = calculatePercentage(thismonthorders.length,lastmonthsorder.length)
      const productChangepercentage = calculatePercentage(thismonthproducts.length,lastmonthproducts.length)
      const OderChangeRevenue = calculatePercentage(thismonthrevenue,lastmonthrevenue)
      
      const revenue = allorders.reduce(
        (total,order) => total + (order.total || 0),0
      )
      
      const count = {
        revenue,
        user: usercount,
        product: productcount,
        orders: allorders
      }
      
      const ordermonthcount = new Array(6).fill(0)
      const ordermonthRevnue = new Array(6).fill(0)
     
        lastsixmonthsorders.forEach((order)=>{
        const creationDate = order.createdAt;
        const diffmonth = (today.getMonth() - creationDate.getMonth()+12)%12;
        if(diffmonth < 6){
          ordermonthcount[6-diffmonth-1] += 1;
          ordermonthRevnue[6-diffmonth-1] += order.total;
        }
      })

      const categoriesCountpromise = categories.map((category)=>Productmodel.countDocuments({category}));
      const categoriesCount = await Promise.all(categoriesCountpromise);
      
      const CategoryCount:Record<string,number>[] = [];
      categories.forEach((category,i)=>{
        CategoryCount.push({
            [category]: Math.round(((categoriesCount[i]/productcount)*100)),
        })
      })

      const genderRatio = {
        male: usercount-femaleUserCount,
        female: femaleUserCount
      }

      const modifiedLatestTransaction = latestTransaction.map((i)=>({
        _id: i._id,
        discount: i.discount,
        amount: i.total,
        quantity: i.orderItems.length,
        status: i.status
      }))

      stats={
        genderRatio,
        CategoryCount,
        userChangepercentage,
        orderChangepercentage,
        productChangepercentage,
        OderChangeRevenue,
        count,
        chart:{
            order: ordermonthcount,
            revenue: ordermonthRevnue
        },
        latestTransaction: modifiedLatestTransaction
      }
      myCache.set("admin-stats",JSON.stringify(stats));
    }
    return res.status(200).json({
        success: true,
        stats,
    })
    }
)

export const getAdminPieChart = TRYCATCH(
    async (req,res,next)=>{
        let PieChartStats = {};
        if(myCache.has("pie-stats")) PieChartStats = JSON.parse(myCache.get("pie-stats") as string);
        else{
            const today = new Date();
            const sixmonthsago = new Date();
            sixmonthsago.setMonth(sixmonthsago.getMonth()-6);
        const [processingOrder,shippedORders,deliveredOrder,categories,productcount,productOutofstock,allOrders,allUsers,Admins,Customers] =await Promise.all([
            ORdersModel.countDocuments({status: "processing"}),
            ORdersModel.countDocuments({status: "shipped"}),
            ORdersModel.countDocuments({status: "delivered"}),
            Productmodel.distinct("category"),
            Productmodel.countDocuments(),
            Productmodel.countDocuments({stock:0}),
            ORdersModel.find({}).select(["total","discount","shippingCharges","tax","subtotal"]),
            User.find({}).select(["dob"]),
            User.countDocuments({role: "admin"}),
            User.countDocuments({role: "user"})
        ])

        const ProductCategoryCount= await getInventorycategories({
            categories,
            productcount,
        })

        const StockAvailability = {
            Instock: productcount - productOutofstock,
            productOutofstock,
        }
        
        const OrderedFullfillment = {
            Processed: processingOrder,
            shipped: shippedORders,
            delivered: deliveredOrder
        }

        const GrossIncome = allOrders.reduce(
        (prev,order)=>prev + (order.total || 0),0);

        const totalDiscount = allOrders.reduce(
        (prev,order)=>prev + (order.discount || 0),0);

        const productionCost = allOrders.reduce(
        (prev,order)=>prev + (order.shippingCharges || 0),0);

        const burnt = allOrders.reduce(
        (prev,order)=>prev + (order.tax || 0),0);
        
        const MarketingCost = Math.round(GrossIncome*(30/100))
        const netMargin = GrossIncome - totalDiscount - productionCost - burnt - MarketingCost;
        const RevnueDistribution = {
            netMargin,
            totalDiscount,
            productionCost,
            burnt,
            MarketingCost,
        }

        const AdminCustomer = {
            admin: Admins,
            customer: Customers,
        }

        const UserageGroup = {
            teen: allUsers.filter((i)=> i.age<20).length,
            adult: allUsers.filter((i)=> i.age>=20 && i.age<40).length,
            old: allUsers.filter((i)=> i.age>=40 ).length,
        }

        PieChartStats = {
            OrderedFullfillment,
            ProductCategoryCount,
            StockAvailability,
            RevnueDistribution,
            AdminCustomer,
            UserageGroup,
        }

        myCache.set("pie-stats",JSON.stringify(PieChartStats));
       
   };

        return res.status(200).json({
            success: true,
            PieChartStats,
        })
    }
)

export const getAdminbarChart = TRYCATCH(
    async (req,res,next)=>{
        let BarChartStat = {};
        if(myCache.has("bar-chart")) BarChartStat= JSON.parse(myCache.get("bar-chart") as string);
        else{
        const today = new Date();
        const sixmonthago = new Date();
        sixmonthago.setMonth(sixmonthago.getMonth()-6);
        const twelvemonthago = new Date();
        twelvemonthago.setMonth(twelvemonthago.getMonth()-12);

        const Sixmonthproductpromise = Productmodel.find({
            createdAt:{$gte: sixmonthago,
            $lte: today,}
        }).select("createdAt");

        const SixmonthUserpromise = User.find({
            createdAt:{
            $gte: sixmonthago,
            $lte: today
        }}).select("createdAt");
    
        const twelvemonthOrderspromise = User.find({
            createdAt:{
            $gte: twelvemonthago,
            $lte: today
        }}).select("createdAt");

        const [Products,Users,Oders] =await Promise.all([
            Sixmonthproductpromise,
            SixmonthUserpromise,
            twelvemonthOrderspromise,
        ])

        const productCount = getChartdata({length: 6,today, docArr: Products});
        const userCount = getChartdata({length: 6,today, docArr: Users});
        const orderCount = getChartdata({length: 12,today, docArr: Oders});

            BarChartStat ={
              users: userCount,
              products: productCount,
              orders: orderCount
            }
            myCache.set("bar-chart",JSON.stringify(BarChartStat))
        }

        return res.status(200).json({
            success: true,
            BarChartStat,
        })
    }
)

export const getAdminlineChart = TRYCATCH(
    async (req,res,next)=>{
        let LineChartStat = {};
        if(myCache.has("line-chart")) LineChartStat= JSON.parse(myCache.get("line-chart") as string);
        else{
            let today = new Date();
            let twelvemonthago = new Date();
            twelvemonthago.setMonth(twelvemonthago.getMonth()-12);
            const baseQuery = {
                $gte:twelvemonthago,
                $lte: today,
            }

            const twelvemonthsProductpromise = Productmodel.find({createdAt: baseQuery}).select("createdAt");
            const twelvemonthsUSerspromise = User.find({createdAt: baseQuery}).select("createdAt");
            const twelvemonthsOrderspromise = ORdersModel.find({createdAt: baseQuery}).select(["createdAt","discount","total"]);

            const [product,users,orders] = await Promise.all([
               twelvemonthsProductpromise,
               twelvemonthsUSerspromise,
               twelvemonthsOrderspromise
            ])

            const productCount = getChartdata({length: 12,today, docArr: product});
            const userCount = getChartdata({length: 12,today, docArr: users});
            const discount = getChartdata({length: 12,today, docArr: orders, property: "discount"});
            const total = getChartdata({length: 12,today, docArr: orders, property: "total"});
 
            LineChartStat ={
                products:productCount,
                users: userCount,
                discount: discount,
                revenue: total,
            }
            myCache.set("line-chart",JSON.stringify(LineChartStat))
        }

        return res.status(200).json({
            success: true,
            LineChartStat,
        })
    }
)