const express= require('express');
const mongoose=require('mongoose')
require('dotenv').config();
const app= express();
const hostname = "0.0.0.0";
const port = process.env.port || 3000;

//routes
const usersRoutes= require('./routes/users')
const endpointRoutes= require('./routes/endpoint')
const apiRoutes= require('./routes/apiData')

//middleware
app.use(express.json())
app.use('/api', usersRoutes)
app.use('/api', endpointRoutes)
app.use('/api', apiRoutes)


mongoose.connect(process.env.MONGODB_URI)
.then(()=>console.log('Connected to MongoDB'))
.catch((err)=>res.json({message:err}))

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});