import express from "express";
import {
  GetSingleUpdate,
  GetallProducts,
  GetallProductsAdmin,
  Getallcategories,
  Getlatestproduct,
  GetsinglePRoductdelete,
  Getsingleproduct,
  productController,
} from "../controllers/productcontroller.js";
import { Adminonly } from "../middleware/adminauth.js";
import { Singlefile } from "../middleware/multer.js";

const Productrouter = express.Router();

Productrouter.route("/new").post(Adminonly, Singlefile, productController);
Productrouter.route("/latest").get(Getlatestproduct);

Productrouter.route("/all").get(GetallProducts);

Productrouter.route("/categories").get(Getallcategories);
Productrouter.route("/admin-products").get(Adminonly, GetallProductsAdmin);
Productrouter.route("/:id")
  .get(Getsingleproduct)
  .put(Adminonly, Singlefile, GetSingleUpdate)
  .delete(Adminonly, GetsinglePRoductdelete);

export default Productrouter;
