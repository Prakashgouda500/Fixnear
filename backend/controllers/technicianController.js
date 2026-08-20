const Technician = require('../models/Technician');
const User = require('../models/User');

const getTechnicians = async (req, res) => {
  try {
    const filter = {};
    if (req.query.approved === 'true') {
      filter.isApproved = 'approved';
    }
    const technicians = await Technician.find(filter)
      .populate('userId', 'name email phone status')
      .populate('categories');
    res.json({ success: true, technicians });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTechnicianById = async (req, res) => {
  try {
    let technician = await Technician.findOne({ userId: req.params.id })
      .populate('userId', 'name email phone status')
      .populate('categories');

    if (!technician) {
      technician = await Technician.findById(req.params.id)
        .populate('userId', 'name email phone status')
        .populate('categories');
      if (!technician) {
        return res.status(404).json({ success: false, message: 'Technician profile not found' });
      }
    }

    res.json({ success: true, technician });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTechnician = async (req, res) => {
  try {
    let technician = await Technician.findOne({ userId: req.params.id });
    if (!technician) {
      technician = await Technician.findById(req.params.id);
    }

    if (!technician) {
      return res.status(404).json({ success: false, message: 'Technician profile not found' });
    }

    if (req.user.role !== 'admin' && req.user.id !== technician.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    const { experience, serviceArea, categories, availability } = req.body;

    technician.experience = experience !== undefined ? Number(experience) : technician.experience;
    technician.serviceArea = serviceArea ? (Array.isArray(serviceArea) ? serviceArea : [serviceArea]) : technician.serviceArea;
    technician.categories = categories || technician.categories;
    technician.availability = availability !== undefined ? availability : technician.availability;

    await technician.save();
    
    const updatedTech = await Technician.findById(technician._id)
      .populate('userId', 'name email phone status')
      .populate('categories');

    res.json({ success: true, message: 'Technician profile updated successfully', technician: updatedTech });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTechnicians, getTechnicianById, updateTechnician };
