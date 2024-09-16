import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js'
import authRouter from './routes/auth.route.js'
import DonorForm from './routes/donor.route.js';
import Donor from '../backend/models/donor.model.js'

dotenv.config();
const PORT = 6001;
const app = express();

app.use(express.json());

app.use('/api/user',userRouter);
app.use('/api/auth',authRouter);
app.use('/api/donor',DonorForm)


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
      success: false,
      message,
      statusCode,
  });
});

mongoose.connect(process.env.MONGO).then(()=>{
    console.log("Connected to DB")
}).catch((err)=>{
    console.log(err)
})

app.listen(PORT,()=>{
    console.log(`port is running at ${PORT}`);
})