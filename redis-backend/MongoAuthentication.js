const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();  // Load environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'my_secret_key';

// Export the router with MongoDB connection
module.exports = function() {
    // Define User schema and model using mongoose instead of direct db collection
    const userSchema = new mongoose.Schema({
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        firstName: { type: String, default: '' },
        lastName: { type: String, default: '' },
        role: { type: String, default: 'user' }
    });
    
    // Check if the model already exists to prevent model overwrite error
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    
    router.post('/register', async (req, res) => {
        try {
            const { email, password, firstName, lastName, role } = req.body;
            
            // Add this line for debugging
            console.log('Registration attempt:', { email, firstName, lastName });
    
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.json({ success: false, message: 'User already exists' });
            }
    
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Set role (default to 'user' if not provided)
            const userRole = role === 'admin' ? 'admin' : 'user';
            
            // Create new user document
            const newUser = new User({
                email,
                password: hashedPassword,
                firstName: firstName || '',
                lastName: lastName || '',
                role: userRole
            });
            
            // Add this line for debugging
            console.log('Creating new user document:', { email, firstName, lastName, role: userRole });
            
            // Insert the user into the database
            await newUser.save();
            
            console.log('User successfully created in database');
            
            res.json({ 
                success: true, 
                message: 'Registration successful', 
                role: userRole 
            });
        } catch (error) {
            console.error('Registration error details:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Server error during registration',
                details: error.message  // Add more details to the error response
            });
        }
    });
    
    router.post('/login', async (req, res) => {
        try {
            const { email, password } = req.body;
            
            // Find user by email
            const user = await User.findOne({ email });
            
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }
            
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }
            
            // Generate token
            const token = jwt.sign({ email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
            
            // Return user info
            res.json({ 
                success: true, 
                user: { 
                    email, 
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName
                }, 
                token 
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ success: false, message: `Server error during login: ${error.message}` });
        }
    });
    
    router.get('/users', async (req, res) => {
        try {
            // Find all users and exclude password field
            const users = await User.find({}, '-password');
            
            // Map to the expected format
            const formattedUsers = users.map(user => ({
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName
            }));
    
            res.json(formattedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ success: false, message: 'Server error while fetching users' });
        }
    });
    
    return router;
};