const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/sports-reservation', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Schema & Model
const reservationSchema = new mongoose.Schema({
  name: String,
  field: String,
  arena: String,
  date: String, // Format: YYYY-MM-DD
  time: String  // Format: '1pm - 2pm'
});

const Reservation = mongoose.model('Reservation', reservationSchema);

// POST /reserve
app.post('/reserve', async (req, res) => {
  const { name, field, arena, date, time } = req.body;

  try {
    // Check for duplicate booking
    const conflict = await Reservation.findOne({ field, arena, date, time });
    if (conflict) {
      return res.status(400).json({ message: 'Slot already booked for this arena!' });
    }

    // Save reservation
    const reservation = new Reservation({ name, field, arena, date, time });
    await reservation.save();

    res.status(200).json({ message: 'Reservation successful!' });
  } catch (err) {
    console.error('Error while saving reservation:', err);
    res.status(500).json({ message: 'Server error while reserving.' });
  }
});

// GET /slots/:field/:arena
app.get('/slots/:field/:arena', async (req, res) => {
  const { field, arena } = req.params;
  try {
    const slots = await Reservation.find({ field, arena });
    res.json(slots);
  } catch (err) {
    console.error('Error while fetching slots:', err);
    res.status(500).json({ message: 'Error fetching slots' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
