const express= require('express');
const mongoose=require('mongoose')
const cors= require('cors')
require('dotenv').config();
const app= express();
const port = process.env.port || 3000;
const corsMiddleware=(req, res, next, ) => {
  const origin=req.headers.origin
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  origin==='http://localhost:4200' ? next() : res.status(403).json({error:"Forbidden"})
}

//routes
const usersRoutes= require('./routes/users')
const endpointRoutes= require('./routes/endpoint')
const apiRoutes= require('./routes/apiData')
const customRoutes= require('./routes/custom')
const keyRoutes= require('./routes/keys')

//middleware
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cors())
app.use('/api', apiRoutes)
app.use(corsMiddleware)
app.use('/api', corsMiddleware, endpointRoutes)
app.use('/api', corsMiddleware, usersRoutes)
app.use('/api', corsMiddleware, customRoutes)
app.use('/api', corsMiddleware, keyRoutes)



mongoose.connect(process.env.MONGODB_URI)
.then(()=>console.log('Connected to MongoDB'))
.catch((err)=>console.log("malio sal"))

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});