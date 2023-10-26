const express=require('express');
const router=express.Router();
const userSchema=require('../models/userSchema')

router.post('/register', (req,res)=>{
    const user=userSchema(req.body);
    user
        .save()
        .then((data)=>res.json(data))
        .catch((err)=>res.json({message:err}))
})

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = userSchema.findOne({ username, password })
        .then((user)=> {
            if(user){
                res.json({ flag: true });
            }else{
                res.status(401).json({ error: 'Credenciales inválidas' });
            }
        })   
        .catch(()=>{
            res.status(500).json({ error: 'Error en el servidor perro' });
        })

})


module.exports= router;