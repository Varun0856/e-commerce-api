import { Router } from "express";
import { verifyJWT, checkRole } from "../middlewares/auth.middleware.js";
import { getProducts, registerProduct } from "../controllers/product.controller.js";
const productRouter = Router();

productRouter.get('/list', getProducts);
productRouter.post('/register', verifyJWT, checkRole('ADMIN'), registerProduct);

export default productRouter;
