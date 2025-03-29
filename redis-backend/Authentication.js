const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();  // Load environment variables

const JWT_SECRET = process.env.JWT_SECRET || 'my_secret_key';

// Export the router with Redis client
module.exports = function(client) {
    router.post('/register', async (req, res) => {
        try {
            const { email, password, firstName, lastName, role } = req.body;
    
            // Check if user already exists
            const existingUser = await client.hGetAll(`user:${email}`);
            if (existingUser.password) {
                return res.json({ success: false, message: 'User already exists' });
            }
    
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Set user fields individually (more compatible with different Redis client versions)
            await client.hSet(`user:${email}`, 'password', hashedPassword);
            await client.hSet(`user:${email}`, 'firstName', firstName || '');
            await client.hSet(`user:${email}`, 'lastName', lastName || '');
            
            // Set role (default to 'user' if not provided)
            const userRole = role === 'admin' ? 'admin' : 'user';
            await client.hSet(`user:${email}`, 'role', userRole);
    
            res.json({ 
                success: true, 
                message: 'Registration successful', 
                role: userRole 
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ success: false, message: 'Server error during registration' });
        }
    });
    
    // Login endpoint (remains mostly the same)
    router.post('/login', async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await client.hGetAll(`user:${email}`);
            if (!user.password) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            // Generate token
            const token = jwt.sign({ email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

            // Return user info including first and last name
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

    // Users endpoint
    router.get('/users', async (req, res) => {
        try {
            const keys = await client.keys('user:*'); // Get all user keys
            const users = [];
    
            for (const key of keys) {
                const userData = await client.hGetAll(key);
                if (userData.password) {
                    users.push({ 
                        email: key.replace('user:', ''), 
                        role: userData.role,
                        firstName: userData.firstName,
                        lastName: userData.lastName
                    });
                }
            }
    
            res.json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ success: false, message: 'Server error while fetching users' });
        }
    });

    return router;
};