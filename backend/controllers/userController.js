const User = require('../models/User');
const Technician = require('../models/Technician');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let technicianProfile = null;
    if (user.role === 'technician') {
      technicianProfile = await Technician.findOne({ userId: user._id }).populate('categories');
    }

    res.json({
      success: true,
      user,
      technicianProfile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, phone, password, experience, serviceArea, categories, availability } = req.body;

    user.name = name || user.name;
    user.phone = phone || user.phone;

    if (password) {
      user.password = password;
    }

    await user.save();

    let technicianProfile = null;
    if (user.role === 'technician') {
      const tech = await Technician.findOne({ userId: user._id });
      if (tech) {
        tech.experience = experience !== undefined ? Number(experience) : tech.experience;
        tech.serviceArea = serviceArea ? (Array.isArray(serviceArea) ? serviceArea : [serviceArea]) : tech.serviceArea;
        tech.categories = categories || tech.categories;
        tech.availability = availability !== undefined ? availability : tech.availability;
        await tech.save();
        technicianProfile = await Technician.findOne({ userId: user._id }).populate('categories');
      }
    }

    const updatedUser = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
      technicianProfile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProfile, updateProfile };
