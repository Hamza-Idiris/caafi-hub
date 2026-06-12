// seed/seeder.js — Populate the database with initial system data
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
const Shop     = require('../models/Shop');
const Order    = require('../models/Order');

const connectDB = require('../config/db');

const USERS = [
  {
    name:     'Caafi Super Admin',
    username: 'admin',
    password: 'Admin@caafi1',
    role:     'admin',
  },
  {
    name:     'Ahmed Hassan',
    username: 'staff1',
    password: 'Staff@123',
    role:     'staff',
  },
  {
    name:     'Hodan Yusuf',
    username: 'staff2',
    password: 'Staff@456',
    role:     'staff',
  },
  {
    name:        'Mohamed Ali',
    username:    'driver1',
    password:    'Driver@123',
    role:        'driver',
    plateNumber: 'SOM-1234',
    vehicle:     'Toyota Dyna',
  },
  {
    name:        'Abdi Warsame',
    username:    'driver2',
    password:    'Driver@456',
    role:        'driver',
    plateNumber: 'SOM-5678',
    vehicle:     'Isuzu NPR',
  },
];

const SHOPS = [
  { shopName: 'Al-Baraka Store',  ownerName: 'Farah Ahmed',  phone: '252615001234', district: 'Hodan',    pin: '1234' },
  { shopName: 'Nuur Grocery',     ownerName: 'Khadija Omar', phone: '252617002345', district: 'Wadajir',  pin: '2345' },
  { shopName: 'Salaam Mart',      ownerName: 'Bile Osman',   phone: '252618003456', district: 'Karaan',   pin: '3456' },
];

const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([User.deleteMany(), Shop.deleteMany(), Order.deleteMany()]);
    console.log('🗑️   Cleared existing data');

    // Insert users
    const users = [];
    for (const u of USERS) {
     users.push(await User.create(u));
    };
    const adminUser = users.find(u => u.role === 'admin');
    console.log(`✅  Inserted ${users.length} system users`);

    // Insert shops (PIN will be hashed via pre-save hook)
    const shops = [];
    for (const s of SHOPS) {
      shops.push(await Shop.create(s));
    }
    console.log(`✅  Inserted ${shops.length} shops`);

    // Sample orders
    const driver1 = users.find(u => u.username === 'driver1');
    const driver2 = users.find(u => u.username === 'driver2');

    await Order.insertMany([
      {
        shop: shops[0]._id, quantity: 20, status: 'Delivered',
        assignedDriver: driver1._id, plateNumber: driver1.plateNumber,
        approvedBy: users.find(u=>u.role==='staff')._id,
        approvedAt: new Date('2025-06-01'), dispatchedAt: new Date('2025-06-01'),
        deliveredAt: new Date('2025-06-01'),
        statusLog: [
          { status:'Pending',   actorModel:'Shop', changedBy:shops[0]._id },
          { status:'Approved',  actorModel:'User', changedBy:users[1]._id },
          { status:'Dispatched',actorModel:'User', changedBy:adminUser._id },
          { status:'On The Way',actorModel:'User', changedBy:driver1._id },
          { status:'Delivered', actorModel:'User', changedBy:driver1._id },
        ],
      },
      {
        shop: shops[1]._id, quantity: 30, status: 'Approved',
        approvedBy: users[1]._id, approvedAt: new Date('2025-06-06'),
        statusLog: [
          { status:'Pending',  actorModel:'Shop', changedBy:shops[1]._id },
          { status:'Approved', actorModel:'User', changedBy:users[1]._id },
        ],
      },
      {
        shop: shops[0]._id, quantity: 15, status: 'Pending',
        statusLog: [{ status:'Pending', actorModel:'Shop', changedBy:shops[0]._id }],
      },
      {
        shop: shops[2]._id, quantity: 25, status: 'On The Way',
        assignedDriver: driver2._id, plateNumber: driver2.plateNumber,
        approvedBy: users[1]._id,
        statusLog: [
          { status:'Pending',    actorModel:'Shop', changedBy:shops[2]._id },
          { status:'Approved',   actorModel:'User', changedBy:users[1]._id },
          { status:'Dispatched', actorModel:'User', changedBy:adminUser._id },
          { status:'On The Way', actorModel:'User', changedBy:driver2._id },
        ],
      },
    ]);
    console.log('✅  Inserted sample orders');

    console.log('\n🌊  Database seeded successfully!\n');
    console.log('── System Login Credentials ──────────────────');
    USERS.forEach(u => console.log(`  ${u.role.padEnd(7)} | ${u.username.padEnd(10)} | ${u.password}`));
    console.log('\n── Shop Login (phone / PIN) ───────────────────');
    SHOPS.forEach(s => console.log(`  ${s.shopName.padEnd(20)} | ${s.phone} | ${s.pin}`));
    console.log('──────────────────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌  Seed error:', err.message);
    process.exit(1);
  }
};

importData();
