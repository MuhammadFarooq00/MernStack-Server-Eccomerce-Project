import express from "express"
import ORderControllers, { ALLorders, GetOrderUpdate, GetOrderdelete, GetSingleORder, Myorders } from "../controllers/orderControllers.js";
import { Adminonly } from "../middleware/adminauth.js";

const orderRoute = express.Router();


orderRoute.route("/new").post(ORderControllers)
orderRoute.route("/my").get(Myorders)
orderRoute.route("/all").get(Adminonly,ALLorders)
orderRoute.route("/:id").get(GetSingleORder).put(Adminonly,GetOrderUpdate).delete(Adminonly,GetOrderdelete)



export default orderRoute;