const ServiceRequest = require('../models/ServiceRequest');
const Technician = require('../models/Technician');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Create service request (Customer)
const createServiceRequest = async (req, res) => {
  try {
    const { categoryId, title, description, address, city, lat, long, preferredDateTime } = req.body;

    let images = [];
    if (req.files) {
      images = req.files.map(file => `/uploads/${file.filename}`);
    } else if (req.file) {
      images = [`/uploads/${req.file.filename}`];
    }

    const serviceRequest = await ServiceRequest.create({
      customerId: req.user.id,
      categoryId,
      title,
      description,
      images,
      location: {
        address,
        city,
        lat: lat ? Number(lat) : undefined,
        long: long ? Number(long) : undefined
      },
      preferredDateTime: new Date(preferredDateTime),
      status: 'PENDING'
    });

    res.status(201).json({ success: true, serviceRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get requests for current customer
const getCustomerRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ customerId: req.user.id })
      .populate('categoryId')
      .populate('technicianId', 'name phone email')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single service request details
const getServiceRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('categoryId')
      .populate('customerId', 'name phone email')
      .populate('technicianId', 'name phone email');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    // Check authorization: customer, assigned tech, or admin
    if (
      req.user.role === 'customer' && request.customerId._id.toString() !== req.user.id &&
      req.user.role === 'technician' && (!request.technicianId || request.technicianId._id.toString() !== req.user.id)
    ) {
      // Allow technicians to view PENDING requests if it matches their category and area
      if (req.user.role === 'technician' && request.status === 'PENDING') {
        const techProfile = await Technician.findOne({ userId: req.user.id });
        if (techProfile && techProfile.categories.includes(request.categoryId.toString()) && techProfile.serviceArea.includes(request.location.city)) {
          // Allowed to view nearby pending request
        } else {
          return res.status(403).json({ success: false, message: 'Not authorized to view this request' });
        }
      } else {
        return res.status(403).json({ success: false, message: 'Not authorized to view this request' });
      }
    }

    res.json({ success: true, request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update request (Customer - only if still PENDING)
const updateServiceRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    if (request.customerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this request' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Cannot edit request after it has been accepted' });
    }

    const { title, description, address, city, lat, long, preferredDateTime, categoryId } = req.body;
    request.title = title || request.title;
    request.description = description || request.description;
    request.categoryId = categoryId || request.categoryId;
    request.preferredDateTime = preferredDateTime ? new Date(preferredDateTime) : request.preferredDateTime;
    if (address || city) {
      request.location = {
        address: address || request.location.address,
        city: city || request.location.city,
        lat: lat ? Number(lat) : request.location.lat,
        long: long ? Number(long) : request.location.long
      };
    }

    await request.save();
    res.json({ success: true, request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel service request (Customer or Admin)
const cancelServiceRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    if (req.user.role === 'customer' && request.customerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this request' });
    }

    if (request.status === 'COMPLETED' || request.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${request.status.toLowerCase()} request` });
    }

    request.status = 'CANCELLED';
    await request.save();

    // Create notification
    if (request.technicianId) {
      await Notification.create({
        userId: request.technicianId,
        title: 'Service Request Cancelled',
        message: `The request "${request.title}" has been cancelled by the customer.`,
        type: 'request_update'
      });
    }

    res.json({ success: true, message: 'Service request cancelled successfully', request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get nearby service requests (Technician)
const getNearbyRequests = async (req, res) => {
  try {
    const techProfile = await Technician.findOne({ userId: req.user.id });
    if (!techProfile) {
      return res.status(404).json({ success: false, message: 'Technician profile not found' });
    }

    if (techProfile.isApproved !== 'approved') {
      return res.status(403).json({ success: false, message: 'Your technician account is pending admin approval' });
    }

    // Find pending requests matching category and city service area
    const requests = await ServiceRequest.find({
      status: 'PENDING',
      categoryId: { $in: techProfile.categories },
      'location.city': { $in: techProfile.serviceArea }
    })
      .populate('categoryId')
      .populate('customerId', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get technician jobs list
const getTechnicianJobs = async (req, res) => {
  try {
    const jobs = await ServiceRequest.find({ technicianId: req.user.id })
      .populate('categoryId')
      .populate('customerId', 'name phone email')
      .sort({ updatedAt: -1 });

    res.json({ success: true, jobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Technician accepts a request
const acceptRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await ServiceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Request is already accepted by another technician or cancelled' });
    }

    const techProfile = await Technician.findOne({ userId: req.user.id });
    if (!techProfile) {
      return res.status(404).json({ success: false, message: 'Technician profile not found' });
    }

    if (techProfile.isApproved !== 'approved') {
      return res.status(403).json({ success: false, message: 'Your technician account is pending admin approval' });
    }

    // Set technician, set a price (either requested in body or default 800)
    request.technicianId = req.user.id;
    request.status = 'ACCEPTED';
    request.price = req.body.price ? Number(req.body.price) : 800; // Default ₹800 service price
    await request.save();

    // Notify customer
    await Notification.create({
      userId: request.customerId,
      title: 'Technician Assigned',
      message: `A technician has accepted your request "${request.title}". Service price is set to ₹${request.price}.`,
      type: 'request_update'
    });

    res.json({ success: true, message: 'Service request accepted successfully', request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Technician rejects a request (does not show in nearby list for them, or simply clears state if they had accepted it)
const rejectRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await ServiceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    // If request is assigned to them and they reject it before starting
    if (request.technicianId && request.technicianId.toString() === req.user.id) {
      if (['PENDING', 'ACCEPTED', 'TECHNICIAN_ASSIGNED'].includes(request.status)) {
        request.technicianId = null;
        request.status = 'PENDING';
        await request.save();

        await Notification.create({
          userId: request.customerId,
          title: 'Request Reassigned',
          message: `The technician assigned to "${request.title}" is no longer available. Reverting request back to pending.`,
          type: 'request_update'
        });

        return res.json({ success: true, message: 'Job released successfully', request });
      } else {
        return res.status(400).json({ success: false, message: 'Cannot reject request in progress or completed' });
      }
    }

    res.json({ success: true, message: 'Request rejected/hidden from view' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update request status (Technician transition flow)
const updateStatus = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body;
    const request = await ServiceRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    if (!request.technicianId || request.technicianId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to change status of this request' });
    }

    const validStatuses = ['ACCEPTED', 'TECHNICIAN_ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update' });
    }

    request.status = status;
    await request.save();

    // Dynamic notifications
    let statusText = status.replace('_', ' ').toLowerCase();
    await Notification.create({
      userId: request.customerId,
      title: `Service Request: ${status}`,
      message: `Your service request "${request.title}" is now ${statusText}.`,
      type: 'request_update'
    });

    res.json({ success: true, message: `Status updated to ${status}`, request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createServiceRequest,
  getCustomerRequests,
  getServiceRequestById,
  updateServiceRequest,
  cancelServiceRequest,
  getNearbyRequests,
  getTechnicianJobs,
  acceptRequest,
  rejectRequest,
  updateStatus
};
