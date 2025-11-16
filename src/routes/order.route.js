import { Router } from "express";
import { verifyJWT, checkRole } from '../middlewares/auth.middleware.js';
import { createOrder, getOrderById, getOrders, updateOrderStatus } from '../controllers/order.controller.js'

const orderRouter = Router();

orderRouter.post('/create', verifyJWT, createOrder);
orderRouter.get('/', verifyJWT, getOrders);
orderRouter.get('/:orderId', verifyJWT, getOrderById);
orderRouter.patch('/update/:orderId', verifyJWT, checkRole('ADMIN'), updateOrderStatus)

export default orderRouter;

