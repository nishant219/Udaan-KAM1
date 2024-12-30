import User from '../models/User.js';
import logger from '../config/winston.js';
import { transferLeadsToNewKam, getUserStats } from '../services/userService.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const createUser = async (req, res) => {
    try {
        const { email, password, name, role, timezone } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            logger.error(`User creation failed: Email ${email} already exists`);
            return res.status(400).json({ error: 'Email already exists' });
        }

        const user = new User({
            email,
            password,
            name,
            role: role || 'KAM',
            timezone: timezone || 'UTC'
        });

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        logger.info(`User created successfully: ${user._id}`);
        return res.status(201).json({ 
            message: 'User created successfully',
            user: userResponse 
        });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ error: 'Error creating user' });
    }
};

export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password' });
      }
  
      const user = await User.findOne({ email }).select('+password'); // Include password in response
      
      if (!user || !user.isActive) {
        logger.error(`Login failed: User ${email} not found or inactive`);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        logger.error(`Login failed: Invalid password for user ${email}`);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      // Update last login
      user.lastLogin = new Date();
      await user.save();
  
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
  
      const userResponse = user.toObject();
      delete userResponse.password;
  
      logger.info(`User ${user._id} logged in successfully`);
      return res.json({
        message: 'Login successful',
        token,
        user: userResponse
      });
    } catch (error) {
      logger.error('Login error:', error.message);
      return res.status(500).json({ error: 'Error logging in' });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Check authorization
        if (req.user.role !== 'ADMIN' && req.user._id.toString() !== id) {
            logger.error(`Unauthorized update attempt for user ${id}`);
            return res.status(403).json({ error: 'Not authorized to update this user' });
        }

        const allowedUpdates = ['name', 'timezone', 'email'];
        const updateData = {};
        
        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updateData[key] = updates[key];
            }
        });

        if (updates.password) {
            updateData.password = await bcrypt.hash(updates.password, 10);
        }

        const user = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            logger.error(`User update failed: User ${id} not found`);
            return res.status(404).json({ error: 'User not found' });
        }

        logger.info(`User ${id} updated successfully`);
        return res.json({ 
            message: 'User updated successfully',
            user 
        });
    } catch (error) {
        logger.error('User update error:', error.message);
        return res.status(500).json({ error: 'Error updating user' });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            logger.error(`Get profile failed: User ${req.params.id} not found`);
            return res.status(404).json({ error: 'User not found' });
        }

        const stats = await getUserStats(req.params.id);

        logger.info(`Profile retrieved for user ${req.params.id}`);
        return res.json({ 
            message: 'Profile retrieved successfully',
            user,
            stats 
        });
    } catch (error) {
        logger.error('Get profile error:', error.message);
        return res.status(500).json({ error: 'Error retrieving user profile' });
    }
};

export const transferLeads = async (req, res) => {
    try {
        const { fromUserId, toUserId } = req.params;

        // Verify admin permission
        if (req.user.role !== 'ADMIN') {
            logger.error(`Unauthorized lead transfer attempt by user ${req.user._id}`);
            return res.status(403).json({ error: 'Only admins can transfer leads' });
        }

        const [fromUser, toUser] = await Promise.all([
            User.findById(fromUserId),
            User.findById(toUserId)
        ]);

        if (!fromUser || !toUser) {
            logger.error('Lead transfer failed: One or both users not found');
            return res.status(404).json({ error: 'One or both users not found' });
        }

        if (fromUser.role !== 'KAM' || toUser.role !== 'KAM') {
            logger.error('Lead transfer failed: Both users must be KAMs');
            return res.status(400).json({ error: 'Both users must be KAMs' });
        }

        const transferredLeads = await transferLeadsToNewKam(fromUserId, toUserId);

        logger.info(`Leads transferred successfully from ${fromUserId} to ${toUserId}`);
        return res.json({
            message: 'Leads transferred successfully',
            transferredLeads
        });
    } catch (error) {
        logger.error('Lead transfer error:', error.message);
        return res.status(500).json({ error: 'Error transferring leads' });
    }
};

export const deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { deactivationReason } = req.body;

        if (req.user.role !== 'ADMIN') {
            logger.error(`Unauthorized deactivation attempt by user ${req.user._id}`);
            return res.status(403).json({ error: 'Only admins can deactivate users' });
        }

        const user = await User.findByIdAndUpdate(
            id,
            {
                isActive: false,
                deactivationReason,
                deactivatedAt: new Date()
            },
            { new: true }
        );

        if (!user) {
            logger.error(`Deactivation failed: User ${id} not found`);
            return res.status(404).json({ error: 'User not found' });
        }

        logger.info(`User ${id} deactivated successfully`);
        return res.json({
            message: 'User deactivated successfully',
            user
        });
    } catch (error) {
        logger.error('User deactivation error:', error.message);
        return res.status(500).json({ error: 'Error deactivating user' });
    }
};

export const listUsers = async (req, res) => {
    try {
        const {
            role,
            isActive,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = {};
        if (role) query.role = role;
        if (isActive !== undefined) query.isActive = isActive;

        const users = await User.find(query)
            .select('-password')
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await User.countDocuments(query);

        logger.info('Users list retrieved successfully');
        return res.json({
            users,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error('List users error:', error.message);
        return res.status(500).json({ error: 'Error retrieving users list' });
    }
};