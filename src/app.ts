import express from "express";
import router from "./routes/user.js";
import { ConnectionDB } from "./utils/Connectiondb.js";
import { errorMiddleware } from "./middleware/errormiddleware.js";
const app = express();
const port =process.env.PORT || 3000
import Productrouter from "./routes/Products.js";
import NodeCache from "node-cache";
import orderRoute from "./routes/order.js";
import morgan from "morgan";
import { config } from "dotenv";
import Paymentroute from "./routes/paymentroute.js";
import AdminStats from "./routes/Adminstats.js";
import Stripe from "stripe";
import cors from "cors";
config({
    path: "./.env"
})
const URI:string = process.env.MONGODB_CONNECT_URI || "";
const stripekey = process.env.STRIPE_kEY || "";
// console.log(process.env.MONGODB_CONNECT_URI)
ConnectionDB();
export const myCache = new NodeCache();
export const stripe = new Stripe(stripekey);
// app.get('/', (req, res) => res.send('Hello World!'))

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.use('/api/v1/user',router)
app.use('/api/v1/product/', Productrouter)
app.use('/api/v1/order', orderRoute)
app.use('/api/v1/payment',Paymentroute)
app.use('/api/v1/admindashboard',AdminStats)

app.use("/uploads",express.static("uploads"));
app.use(errorMiddleware);
app.listen(port, () => console.log(`Example app listening on port ${port}!`))  