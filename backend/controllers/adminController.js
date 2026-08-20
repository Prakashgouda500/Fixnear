const User = require('../models/User');
const Technician = require('../models/Technician');
const ServiceRequest = require('../models/ServiceRequest');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Complaint = require('../models/Complaint');
const Category = require('../models/Category');

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalTechnicians = await User.countDocuments({ role: 'technician' });
    const pendingApprovals = await Technician.countDocuments({ isApproved: 'pending' });

    const activeRequests = await ServiceRequest.countDocuments({
      status: { $in: ['PENDING', 'ACCEPTED', 'TECHNICIAN_ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS'] }
    });
    const completedServices = await ServiceRequest.countDocuments({ status: 'COMPLETED' });
    const cancelledServices = await ServiceRequest.countDocuments({ status: 'CANCELLED' });

    // Revenue calculations (from completed payments)
    const payments = await Payment.find({ status: 'COMPLETED' });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const platformCommission = payments.reduce((sum, p) => sum + p.platformFee, 0);

    // User growth chart data (group by date)
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 10 }
    ]);

    // Service category stats
    const categoryStats = await ServiceRequest.aggregate([
      {
        $group: {
          _id: "$categoryId",
          count: { $sum: 1 }
        }
      }
    ]);

    const populatedCategoryStats = await Promise.all(categoryStats.map(async (stat) => {
      const category = await Category.findById(stat._id);
      return {
        category: category ? category.name : 'Unknown',
        count: stat.count
      };
    }));

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTechnicians,
        pendingApprovals,
        activeRequests,
        completedServices,
        cancelledServices,
        totalRevenue,
        platformCommission,
        userGrowth: userGrowth.map(item => ({ date: item._id, count: item.count })),
        categoryStats: populatedCategoryStats
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTechnicians = async (req, res) => {
  try {
    const technicians = await Technician.find()
      .populate('userId', 'name email phone status')
      .populate('categories')
      .sort({ createdAt: -1 });

    res.json({ success: true, technicians });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getServiceRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find()
      .populate('customerId', 'name email phone')
      .populate('technicianId', 'name email phone')
      .populate('categoryId')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveTechnician = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const tech = await Technician.findById(req.params.id);
    if (!tech) {
      return res.status(404).json({ success: false, message: 'Technician not found' });
    }

    tech.isApproved = status;
    await tech.save();

    res.json({ success: true, message: `Technician status updated to ${status}`, technician: tech });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();

    res.json({ success: true, message: `User status changed to ${user.status}`, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'technician') {
      await Technician.findOneAndDelete({ userId: user._id });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('serviceRequestId')
      .populate('reporterId', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, complaints });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const resolveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = 'RESOLVED';
    await complaint.save();

    res.json({ success: true, message: 'Complaint marked as resolved', complaint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('customerId', 'name email')
      .populate('technicianId', 'name email')
      .populate('serviceRequestId')
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('customerId', 'name email')
      .populate('technicianId', 'name email')
      .populate('serviceRequestId')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getTechnicians,
  getServiceRequests,
  approveTechnician,
  toggleUserStatus,
  deleteUser,
  getComplaints,
  resolveComplaint,
  getPayments,
  getReviews
};
