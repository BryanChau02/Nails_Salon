const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Backend is connected!');
});

// Get all appointments
app.get('/appointments', (req, res) => {
  const filePath = 'appointments.json';

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: '❌ Failed to load appointments' });
    }

    try {
      const appointments = JSON.parse(data);
      res.json(appointments);
    } catch (parseErr) {
      res.status(500).json({ message: '❌ Failed to parse appointment data' });
    }
  });
});

// Submit a new appointment
app.post('/appointment', (req, res) => {
  const { date, time } = req.body;

  if (!date || !time) {
    return res.status(400).json({ message: '❌ Missing date or time' });
  }

  const newAppt = { date, time };
  const filePath = 'appointments.json';

  // Step 1: Read existing appointments
  fs.readFile(filePath, 'utf8', (err, data) => {
    let appointments = [];

    if (!err && data) {
      try {
        appointments = JSON.parse(data);
      } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
      }
    }

    // Step 2: Check for duplicate
    const exists = appointments.some(appt => appt.date === date && appt.time === time);

    if (exists) {
      return res.status(409).json({ message: '⚠️ Time slot already booked. Please choose another.' });
    }

    // Step 3: Save the new appointment
    appointments.push(newAppt);

    fs.writeFile(filePath, JSON.stringify(appointments, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Error writing to file:', writeErr);
        return res.status(500).json({ message: '❌ Failed to save appointment' });
      }

      console.log('✅ Appointment saved:', newAppt);
      res.json({ message: `✅ Appointment booked for ${date} at ${time}` });
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
