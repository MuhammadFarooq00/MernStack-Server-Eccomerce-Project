import express from "express";
import { Allcoupons, Applydiscount, Deletecoupon, Newcoupn, PaymentIntent} from "../controllers/paymentcontrollers.js";
import { Adminonly } from "../middleware/adminauth.js";

const Paymentroute = express.Router();

Paymentroute.route("/create").post(PaymentIntent)
Paymentroute.route("/coupon/new").post(Adminonly,Newcoupn)
Paymentroute.route("/discount").get(Applydiscount)
Paymentroute.route("/coupon/all").get(Adminonly,Allcoupons)
Paymentroute.route("/coupon/:id").delete(Adminonly,Deletecoupon)


export default Paymentroute;