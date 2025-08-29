const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// In-memory storage for demo purposes
let tickets = [];
let bookings = [];

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Mumbai Transport API is running',
    version: '1.0.0'
  });
});

// Get ticket data for a line
app.get('/api/tickets/:line', (req, res) => {
  const { line } = req.params;

  const ticketData = {
    line: line,
    available: true,
    price: Math.floor(Math.random() * 30) + 10,
    stations: ['Versova', 'Andheri', 'Ghatkopar'],
    lastUpdated: new Date().toISOString()
  };

  res.json({
    success: true,
    data: ticketData
  });
});

// Buy ticket
app.post('/api/tickets/buy', (req, res) => {
  const { line, from, to, quantity, timestamp, userAgent } = req.body;

  // Validate input
  if (!from || !to || !quantity) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: from, to, quantity'
    });
  }

  if (from === to) {
    return res.status(400).json({
      success: false,
      error: 'Departure and destination cannot be the same'
    });
  }

  if (quantity < 1 || quantity > 10) {
    return res.status(400).json({
      success: false,
      error: 'Quantity must be between 1 and 10'
    });
  }

  // Calculate fare (simple logic)
  const baseFare = Math.floor(Math.random() * 30) + 10;
  const totalAmount = baseFare * quantity;

  // Generate ticket
  const ticketId = `TKT${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  const qrCode = `QR${Date.now()}`;

  const ticket = {
    ticketId,
    qrCode,
    line,
    from,
    to,
    quantity,
    price: baseFare,
    totalAmount,
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    purchasedAt: timestamp,
    status: 'active',
    userAgent
  };

  // Store ticket
  tickets.push(ticket);

  res.json({
    success: true,
    data: ticket,
    message: 'Ticket purchased successfully'
  });
});

// Get fare data for a line
app.get('/api/fares/:line', (req, res) => {
  const { line } = req.params;

  const fareData = {
    name: line === 'line1' ? 'Line 1 (Versova-Andheri-Ghatkopar)' : 'Line 2 (Dahisar-Charkop-Bandra)',
    fares: [
      { distance: '0-3 km', fare: 10 },
      { distance: '3-12 km', fare: 20 },
      { distance: '12-27 km', fare: 30 },
      { distance: '27+ km', fare: 40 }
    ],
    lastUpdated: new Date().toISOString()
  };

  res.json({
    success: true,
    data: fareData
  });
});

// Get ride comparison data
app.get('/api/rides/compare', (req, res) => {
  const rideData = [
    {
      type: 'metro',
      name: 'Metro',
      duration: '25 min',
      fare: '₹30',
      stops: 8,
      frequency: 'Every 3-5 min',
      rating: 4.5,
      availability: 'High'
    },
    {
      type: 'bus',
      name: 'Bus',
      duration: '45 min',
      fare: '₹15',
      stops: 12,
      frequency: 'Every 10-15 min',
      rating: 3.8,
      availability: 'Medium'
    },
    {
      type: 'auto',
      name: 'Auto Rickshaw',
      duration: '20 min',
      fare: '₹80',
      stops: 0,
      frequency: 'On demand',
      rating: 4.2,
      availability: 'High'
    }
  ];

  res.json({
    success: true,
    data: rideData
  });
});

// Book a ride
app.post('/api/rides/book', (req, res) => {
  const { rideType, pickup, drop, passengers } = req.body;

  // Validate input
  if (!pickup || !drop || !passengers) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }

  // Generate booking
  const bookingId = `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  const driver = {
    name: 'Rajesh Kumar',
    phone: '+91-9876543210',
    vehicle: rideType === 'auto' ? 'Auto Rickshaw' : 'Sedan',
    rating: (Math.random() * 0.5 + 4.5).toFixed(1),
    eta: Math.floor(Math.random() * 15) + 5 // 5-20 minutes
  };

  const booking = {
    bookingId,
    rideType,
    pickup,
    drop,
    passengers: parseInt(passengers),
    driver,
    status: 'confirmed',
    bookedAt: new Date().toISOString(),
    estimatedArrival: new Date(Date.now() + driver.eta * 60 * 1000).toISOString()
  };

  // Store booking
  bookings.push(booking);

  res.json({
    success: true,
    data: booking,
    message: 'Ride booked successfully'
  });
});

// Get user bookings
app.get('/api/bookings/:userId?', (req, res) => {
  const { userId } = req.params;

  // In a real app, you'd filter by user ID
  const userBookings = bookings.slice(-5); // Last 5 bookings

  res.json({
    success: true,
    data: userBookings
  });
});

// Get route planning data
app.post('/api/routes/plan', (req, res) => {
  const { from, to, preferences } = req.body;

  if (!from || !to) {
    return res.status(400).json({
      success: false,
      error: 'Missing from or to location'
    });
  }

  // Simulate route planning
  const routes = [
    {
      id: 'route1',
      type: 'metro',
      name: 'Metro Route 1',
      from: from,
      to: to,
      duration: '25 min',
      fare: 30,
      stops: ['Station A', 'Station B', 'Station C'],
      nextDeparture: '2 min',
      frequency: 'Every 3-5 min'
    },
    {
      id: 'route2',
      type: 'bus',
      name: 'Bus Route 45',
      from: from,
      to: to,
      duration: '45 min',
      fare: 15,
      stops: ['Stop 1', 'Stop 2', 'Stop 3', 'Stop 4'],
      nextDeparture: '5 min',
      frequency: 'Every 10-15 min'
    }
  ];

  res.json({
    success: true,
    data: routes,
    message: `Found ${routes.length} routes from ${from} to ${to}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mumbai Transport API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎫 Tickets API: http://localhost:${PORT}/api/tickets/line1`);
  console.log(`💰 Fares API: http://localhost:${PORT}/api/fares/line1`);
  console.log(`🚗 Rides API: http://localhost:${PORT}/api/rides/compare`);
});

module.exports = app;