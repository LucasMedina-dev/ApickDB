const express= require('express');
const mongoose=require('mongoose')
const cors= require('cors')
require('dotenv').config();
const app= express();
const port = process.env.port || 3000;

//routes
const usersRoutes= require('./routes/users')
const endpointRoutes= require('./routes/endpoint')
const apiRoutes= require('./routes/apiData')

//middleware
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use('/api', usersRoutes)
app.use('/api', endpointRoutes)
app.use('/api', apiRoutes)

app.use(cors())

mongoose.connect(process.env.MONGODB_URI)
.then(()=>console.log('Connected to MongoDB'))
.catch((err)=>console.log("malio sal"))

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});