import express from 'express'
import errorHandler from './middlewares/error.middleware.js'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.route.js';
import productRouter from './routes/product.route.js';
import cartRouter from './routes/cart.route.js';
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
      refreshAccessToken: 'POST api/v1/auth/token'
    }
  })
})

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/product', productRouter);
app.use('/api/v1/cart', cartRouter);

export default app;
