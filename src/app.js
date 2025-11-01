import express from 'express'
import errorHandler from './middlewares/error.middleware.js'
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);

export default app;
