import { Router } from "express";
import { verifyJWT, checkRole } from "../middlewares/auth.middleware.js";
import { getProductById, getProducts, registerProduct, updateProduct } from "../controllers/product.controller.js";
const productRouter = Router();

productRouter.get('/list', getProducts);
productRouter.get('/list/:id', getProductById);
productRouter.post('/register', verifyJWT, checkRole('ADMIN'), registerProduct);
productRouter.patch('/update/:id', verifyJWT, checkRole('ADMIN'), updateProduct);

export default productRouter;
