const User = require('../models/User');
const Technician = require('../models/Technician');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fixnear_super_secret_key_123456', {
    expiresIn: '30d'
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, experience, serviceArea, categories } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'customer'
    });

    if (user.role === 'technician') {
      if (experience === undefined || !serviceArea || !categories || !categories.length) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: 'Technicians must specify experience, service area, and service categories'
        });
      }

      await Technician.create({
        userId: user._id,
        experience,
        serviceArea: Array.isArray(serviceArea) ? serviceArea : [serviceArea],
        categories: categories,
        isApproved: 'pending'
      });
    }

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact support.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    let technicianProfile = null;
    if (user.role === 'technician') {
      technicianProfile = await Technician.findOne({ userId: user._id }).populate('categories');
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        technicianProfile
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login };
