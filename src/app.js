import express from 'express'
import errorHandler from './middlewares/error.middleware.js'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.route.js';
import productRouter from './routes/product.route.js';
import cartRouter from './routes/cart.route.js';
import orderRouter from './routes/order.route.js';
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);
app.use(cookieParser());

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    baseURL: '/api/v1',
    endpoints: {
      register: 'POST api/v1/auth/register',
      login: 'POST api/v1/auth/login',
      logout: 'POST api/v1/auth/logout',
      refreshAccessToken: 'POST api/v1/auth/token',
      getProducts: 'GET api/v1/product/list',
      getProductById: 'GET api/v1/product/list/:id',
      registerProduct: 'POST api/v1/product/register',
      updateProduct: 'PATCH api/v1/product/update/:id',
      addToCart: 'POST api/v1/cart/add',
      getCart: 'GET api/v1/cart/',
      updateCartItem: 'PATCH api/v1/cart/update/:productId',
      removeFromCart: 'DELETE api/v1/cart/delete/:productId',
      createOrder: 'POST api/v1/order/create',
      getOrders: 'GET api/v1/order/',
      getOrderById: 'GET api/v1/order/:orderId',
      updateOrderStatus: 'PATCH api/v1/order/update/:orderId'
    }
  })
})

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/product', productRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/order', orderRouter);

export default app;
