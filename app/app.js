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
const customRoutes= require('./routes/custom')
const keyRoutes= require('./routes/keys')

//middleware
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Origin', '*'); // Cambia '*' por el dominio permitido si es conocido
  next();
});
app.use(cors())
app.use('/api', usersRoutes)
app.use('/api', endpointRoutes)
app.use('/api', apiRoutes)
app.use('/api', customRoutes)
app.use('/api', keyRoutes)






mongoose.connect(process.env.MONGODB_URI)
.then(()=>console.log('Connected to MongoDB'))
.catch((err)=>console.log("malio sal"))

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});