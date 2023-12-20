const express = require('express');
const router = express.Router();
const userSchema = require('../models/userSchema')

// ------------------------------------------------------------------------------------------------------------------------------ROUTE /REGISTER
const registerUser = async (req, res) => {
    try {
        const data = await userSchema(req.body).save()
        res.json(data)
    } catch (error) {
        console.error(error);
        res.status(error.statusCode).json({ message: "Failed to register a new user." });
    }
}

// ------------------------------------------------------------------------------------------------------------------------------ROUTE /LOGIN
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await userSchema.findOne({ username, password })
        if (user) {
            res.json({ flag: true });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(error.statusCode).json({ message: "Failed to login user." });
    }
}

// ------------------------------------------------------------------------------------------------------------------------------ROUTES
router.post('/register', registerUser)
router.post('/login', loginUser)

module.exports = router;