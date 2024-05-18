import express from "express";
import Usercontroller, { DeleteUser, GetOneUser, GetallUser } from "../controllers/usercontroller.js";
import { Adminonly } from "../middleware/adminauth.js";

const router = express.Router();

router.route("/new").post(Usercontroller);
router.route("/all").get(Adminonly,GetallUser);
router.route("/:id").get(GetOneUser);
router.route("/:id").delete(Adminonly,DeleteUser);

export default router;
