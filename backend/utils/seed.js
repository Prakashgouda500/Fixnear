const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/db');

const User = require('../models/User');
const Technician = require('../models/Technician');
const Category = require('../models/Category');
const ServiceRequest = require('../models/ServiceRequest');
const Review = require('../models/Review');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const Complaint = require('../models/Complaint');

const seedData = async () => {
  try {
    // Connect to DB
    await connectDB();

    console.log('Clearing database...');
    await User.deleteMany();
    await Technician.deleteMany();
    await Category.deleteMany();
    await ServiceRequest.deleteMany();
    await Review.deleteMany();
    await Payment.deleteMany();
    await Notification.deleteMany();
    await Complaint.deleteMany();

    console.log('Seeding categories...');
    const categoriesData = [
      { name: 'Laptop Repair', description: 'Repairs for laptops, keyboards, screens, and memory upgrades.', icon: 'Laptop' },
      { name: 'Mobile Repair', description: 'Screen replacement, battery replacement, and charging issues.', icon: 'Smartphone' },
      { name: 'Wi-Fi/Internet', description: 'Router setup, configuration, and connectivity issues.', icon: 'Wifi' },
      { name: 'Electrical', description: 'Light installation, switchboard repair, and wiring troubleshooting.', icon: 'Zap' },
      { name: 'Plumbing', description: 'Leak fixing, tap repair, and drain unclogging.', icon: 'Droplet' },
      { name: 'AC Repair', description: 'AC servicing, filter cleaning, and gas filling.', icon: 'AirVent' },
      { name: 'Refrigerator Repair', description: 'Fridge repair, thermostat adjustment, and motor maintenance.', icon: 'IceCream' },
      { name: 'Washing Machine Repair', description: 'Spin cycle repair, drainage issues, and drum leveling.', icon: 'Activity' },
      { name: 'Computer Support', description: 'Software installs, OS formatting, and malware removals.', icon: 'Cpu' },
      { name: 'CCTV Installation', description: 'CCTV setup, DVR configuration, and cabling services.', icon: 'Video' }
    ];
    const categories = await Category.insertMany(categoriesData);
    console.log(`${categories.length} categories seeded.`);

    console.log('Seeding users (Admin)...');
    const adminUser = await User.create({
      name: 'FixNear Admin',
      email: 'admin@fixnear.com',
      password: 'Password@123',
      role: 'admin',
      phone: '9876543210'
    });

    console.log('Seeding users (Customers)...');
    const customers = [];
    for (let i = 1; i <= 10; i++) {
      const customer = await User.create({
        name: `Customer User ${i}`,
        email: `customer${i}@fixnear.com`,
        password: 'Password@123',
        role: 'customer',
        phone: `999999990${i % 10}`
      });
      customers.push(customer);
    }
    console.log(`${customers.length} customers seeded.`);

    console.log('Seeding users and profiles (Technicians)...');
    const technicians = [];
    const techAreas = ['Mumbai', 'Mumbai', 'Mumbai', 'Mumbai', 'Mumbai'];
    
    for (let i = 1; i <= 5; i++) {
      const techUser = await User.create({
        name: `Technician User ${i}`,
        email: `tech${i}@fixnear.com`,
        password: 'Password@123',
        role: 'technician',
        phone: `888888880${i}`
      });

      // Assign categories
      const techCats = [
        categories[(i - 1) % categories.length]._id,
        categories[i % categories.length]._id
      ];

      const technicianProfile = await Technician.create({
        userId: techUser._id,
        categories: techCats,
        experience: 2 + i * 2,
        serviceArea: [techAreas[i - 1]],
        availability: true,
        isApproved: i === 5 ? 'pending' : 'approved' // 5th is pending to allow approval testing
      });

      technicians.push({ user: techUser, profile: technicianProfile });
    }
    console.log(`${technicians.length} technician profiles seeded.`);

    console.log('Seeding service requests...');
    // Create a PENDING request
    const req1 = await ServiceRequest.create({
      customerId: customers[0]._id,
      categoryId: categories[0]._id,
      title: 'Laptop shutting down randomly',
      description: 'My laptop turns off automatically after 15 minutes of usage, especially while watching videos. It gets very hot.',
      location: { address: 'Flat 101, Sea View Apartments', city: 'Mumbai', lat: 19.076, long: 72.877 },
      preferredDateTime: new Date(Date.now() + 86400000), // tomorrow
      status: 'PENDING'
    });

    // Create an ACCEPTED request
    const req2 = await ServiceRequest.create({
      customerId: customers[1]._id,
      categoryId: categories[3]._id,
      title: 'Living room light sparking',
      description: 'When I turn on the main living room light, it sparks. I turned off the fuse for now.',
      location: { address: 'Room 5, Gali 2, Dharavi', city: 'Mumbai', lat: 19.038, long: 72.853 },
      preferredDateTime: new Date(Date.now() + 43200000), // in 12h
      status: 'ACCEPTED',
      technicianId: technicians[0].user._id,
      price: 900
    });

    // Create a COMPLETED request with payment and review
    const req3 = await ServiceRequest.create({
      customerId: customers[2]._id,
      categoryId: categories[4]._id,
      title: 'Kitchen sink pipe leaking',
      description: 'Water is dripping slowly from the pipe under the kitchen sink. Wasting a lot of water.',
      location: { address: 'Row House B, Sector 4, Vashi', city: 'Mumbai', lat: 19.033, long: 73.029 },
      preferredDateTime: new Date(Date.now() - 86400000), // yesterday
      status: 'COMPLETED',
      technicianId: technicians[1].user._id,
      price: 800
    });

    // Mock payment for completed request
    const payment3 = await Payment.create({
      serviceRequestId: req3._id,
      customerId: customers[2]._id,
      technicianId: technicians[1].user._id,
      amount: 800,
      platformFee: 80,
      technicianEarning: 720,
      status: 'COMPLETED',
      paymentMethod: 'mock_card',
      transactionId: `TXN-SEED-12345`
    });

    // Increment tech earnings
    await Technician.findOneAndUpdate(
      { userId: technicians[1].user._id },
      { $inc: { totalEarnings: 720 } }
    );

    // Review for completed request
    const review3 = await Review.create({
      serviceRequestId: req3._id,
      customerId: customers[2]._id,
      technicianId: technicians[1].user._id,
      rating: 5,
      comment: 'Excellent plumbing work! Solved the leak in 10 minutes. Very professional.'
    });

    // Update tech average rating
    await Technician.findOneAndUpdate(
      { userId: technicians[1].user._id },
      { avgRating: 5.0 }
    );

    console.log('Seeding mock notifications...');
    await Notification.create({
      userId: customers[0]._id,
      title: 'Welcome to FixNear',
      message: 'Thank you for registering. You can now start booking local technicians!',
      type: 'general'
    });

    await Notification.create({
      userId: technicians[0].user._id,
      title: 'New Nearby Service Request',
      message: 'A new Electrical request has been posted in your service area.',
      type: 'request_update'
    });

    console.log('Database seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
