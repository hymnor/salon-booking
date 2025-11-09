/**
 * Simple Salon Booking backend using Express.
 * Stores bookings in a JSON file (data/bookings.json).
 * Optional email notifications via Nodemailer (setup instructions in README).
 */
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Data path
const dataDir = path.join(__dirname, 'data');
const bookingsPath = path.join(dataDir, 'bookings.json');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(bookingsPath)) fs.writeFileSync(bookingsPath, '[]', 'utf-8');

// helpers
function readBookings() {
  try {
    return JSON.parse(fs.readFileSync(bookingsPath, 'utf-8'));
  } catch (e) {
    return [];
  }
}
function writeBookings(b) {
  fs.writeFileSync(bookingsPath, JSON.stringify(b, null, 2), 'utf-8');
}
function isConflict(bookings, date, time, staff) {
  return bookings.some(b => b.date === date && b.time === time && b.staff === staff);
}

// Optional email (disabled by default)
// To enable, set EMAIL_FROM, EMAIL_TO, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env
let sendEmail = async () => {};
if (process.env.SMTP_HOST) {
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  sendEmail = async (subject, text) => {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: process.env.EMAIL_TO || process.env.SMTP_USER,
        subject, text
      });
    } catch (err) {
      console.error('Email error:', err.message);
    }
  };
}

// Routes
app.get('/api/bookings', (req, res) => {
  const bookings = readBookings();
  res.json(bookings);
});

app.post('/api/availability', (req, res) => {
  const { date, time, staff } = req.body || {};
  if (!date || !time || !staff) {
    return res.status(400).json({ ok: false, message: 'Missing date, time, or staff' });
  }
  const bookings = readBookings();
  const conflict = isConflict(bookings, date, time, staff);
  res.json({ ok: true, available: !conflict });
});

app.post('/api/bookings', async (req, res) => {
  const { name, phone, email, service, staff, date, time, notes } = req.body || {};
  if (!name || !phone || !service || !staff || !date || !time) {
    return res.status(400).json({ ok: false, message: 'Missing required fields' });
  }
  const bookings = readBookings();
  if (isConflict(bookings, date, time, staff)) {
    return res.status(409).json({ ok: false, message: 'Slot unavailable for that staff member' });
  }
  const booking = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    name, phone, email: email || '', service, staff, date, time, notes: notes || ''
  };
  bookings.push(booking);
  writeBookings(bookings);

  const summary = `New booking:
Name: ${name}
Phone: ${phone}
Email: ${email || '-'}
Service: ${service}
Staff: ${staff}
Date: ${date}
Time: ${time}
Notes: ${notes || '-'}
`;
  await sendEmail('New Salon Booking', summary);
  res.json({ ok: true, booking });
});

// Fallback to index.html for root
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Salon Booking server running at http://localhost:${PORT}`);
});
