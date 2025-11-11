import Router from 'express';
const cartRouter = Router();
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { addToCart, getCart, removeFromCart, updateCartItem } from '../controllers/cart.controller.js'

cartRouter.post('/add', verifyJWT, addToCart);
cartRouter.get('/', verifyJWT, getCart);
cartRouter.patch('/update/:productId', verifyJWT, updateCartItem);
cartRouter.delete('/delete/:productId', verifyJWT, removeFromCart);

export default cartRouter;
