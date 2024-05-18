import express from "express";
import { getAdminDashboard, getAdminPieChart, getAdminbarChart, getAdminlineChart } from "../controllers/Adminstatscontroller.js";
import { Adminonly } from "../middleware/adminauth.js";

const AdminStats = express.Router();


AdminStats.route("/stat").get(getAdminDashboard)
AdminStats.route("/pie").get(Adminonly,getAdminPieChart)
AdminStats.route("/bar").get(Adminonly,getAdminbarChart)
AdminStats.route("/line").get(Adminonly,getAdminlineChart)


export default AdminStats;