const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Real Mumbai transport data
const mockData = {
  tickets: {
    line1: {
      name: 'Line 1 – Blue Line (Versova ↔ Ghatkopar)',
      price: 30,
      available: true,
      nextTrain: '5 minutes',
      route: 'Versova ↔ Ghatkopar via Andheri (11.4 km, 12 stations)',
      operator: 'MMRDA'
    },
    line2a: {
      name: 'Line 2A – Yellow Line (Dahisar East ↔ D N Nagar)',
      price: 25,
      available: true,
      nextTrain: '3 minutes',
      route: 'Dahisar East ↔ D N Nagar (18.6 km, 17 stations)',
      operator: 'MMRDA'
    },
    line2b: {
      name: 'Line 2B – Yellow Line (D N Nagar ↔ Mandale)',
      price: 35,
      available: false,
      nextTrain: 'Under construction',
      route: 'D N Nagar ↔ Mandale (23.6 km, 20 stations)',
      operator: 'MMRDA'
    },
    line3: {
      name: 'Line 3 – Aqua Line (Colaba–Bandra–Aarey)',
      price: 40,
      available: true,
      nextTrain: '8 minutes',
      route: 'Colaba ↔ Aarey (33.5 km, 27 stations)',
      operator: 'MMRC & DMRC'
    },
    line7: {
      name: 'Line 7 – Red Line (Dahisar East ↔ Andheri East)',
      price: 28,
      available: true,
      nextTrain: '4 minutes',
      route: 'Dahisar East ↔ Andheri East (16.5 km)',
      operator: 'MMRDA'
    }
  },
  fares: {
    line1: [
      { distance: '0-3 km', fare: 10 },
      { distance: '3-12 km', fare: 20 },
      { distance: '12-27 km', fare: 30 },
      { distance: '27+ km', fare: 40 }
    ],
    line2a: [
      { distance: '0-3 km', fare: 10 },
      { distance: '3-12 km', fare: 18 },
      { distance: '12-27 km', fare: 25 },
      { distance: '27+ km', fare: 35 }
    ],
    line3: [
      { distance: '0-3 km', fare: 10 },
      { distance: '3-12 km', fare: 22 },
      { distance: '12-27 km', fare: 35 },
      { distance: '27+ km', fare: 45 }
    ],
    line7: [
      { distance: '0-3 km', fare: 10 },
      { distance: '3-12 km', fare: 20 },
      { distance: '12-27 km', fare: 28 },
      { distance: '27+ km', fare: 38 }
    ]
  },
  routes: [
    {
      id: 1,
      from: 'Versova',
      to: 'Ghatkopar',
      duration: '21 min',
      fare: 30,
      type: 'metro',
      line: 'Line 1 (Blue)',
      stops: ['Versova', 'D.N. Nagar', 'Azad Nagar', 'Andheri', 'Western Express Highway', 'Chakala', 'Airport Road', 'Marol Naka', 'Saki Naka', 'Asalpha', 'Jagruti Nagar', 'Ghatkopar']
    },
    {
      id: 2,
      from: 'Dahisar East',
      to: 'D N Nagar',
      duration: '32 min',
      fare: 25,
      type: 'metro',
      line: 'Line 2A (Yellow)',
      stops: ['Dahisar East', 'Anand Nagar', 'Goregaon', 'Oshiwara', 'Jogeshwari', 'Adarsh Nagar', 'D N Nagar']
    },
    {
      id: 3,
      from: 'Colaba',
      to: 'Bandra',
      duration: '18 min',
      fare: 22,
      type: 'metro',
      line: 'Line 3 (Aqua)',
      stops: ['Colaba', 'Churchgate', 'Mumbai Central', 'Mahalaxmi', 'Lower Parel', 'Prabhadevi', 'Dadar', 'Matunga Road', 'Mahim Junction', 'Bandra']
    },
    {
      id: 4,
      from: 'Dahisar East',
      to: 'Andheri East',
      duration: '28 min',
      fare: 28,
      type: 'metro',
      line: 'Line 7 (Red)',
      stops: ['Dahisar East', 'Borivali', 'Kandivali', 'Malad', 'Goregaon', 'Jogeshwari', 'Andheri East']
    }
  ],
  // Real Mumbai fare data for different transport modes
  transportFares: {
    autoRickshaw: {
      name: 'Auto-Rickshaw (CNG, Metered)',
      minimumFare: 26,
      perKmRate: 17.14,
      nightSurcharge: 25,
      minimumDistance: 1.5
    },
    kaaliPeeliTaxi: {
      name: 'Kaali-Peeli Taxi (CNG, Metered)',
      minimumFare: 31,
      perKmRate: 20.66,
      nightSurcharge: 25,
      minimumDistance: 1.5,
      acExtra: 10
    },
    coolCab: {
      name: 'Cool Cab (AC Metered Taxi)',
      minimumFare: 48,
      perKmRate: 37.20,
      nightSurcharge: 25,
      minimumDistance: 1.5
    },
    aggregatorCab: {
      name: 'App Aggregator (Uber/Ola)',
      pricing: 'Dynamic',
      surgeCap: 1.5,
      discountCap: 25,
      minimumTrip: 3,
      driverShare: 80
    }
  }
};

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mumbai Transport API is running' });
});

app.get('/api/tickets/:line', (req, res) => {
  const { line } = req.params;
  const ticketData = mockData.tickets[line];

  if (ticketData) {
    res.json({
      success: true,
      data: ticketData
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Line not found'
    });
  }
});

app.post('/api/tickets/buy', (req, res) => {
  const { line, from, to, quantity = 1 } = req.body;

  // Simulate ticket purchase
  setTimeout(() => {
    res.json({
      success: true,
      data: {
        ticketId: `TICKET-${Date.now()}`,
        line,
        from,
        to,
        quantity,
        totalAmount: mockData.tickets[line]?.price * quantity || 30,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        qrCode: `QR-${Math.random().toString(36).substr(2, 9)}`
      }
    });
  }, 1000); // Simulate processing delay
});

app.get('/api/fares/:line', (req, res) => {
  const { line } = req.params;
  const fareData = mockData.fares[line];

  if (fareData) {
    res.json({
      success: true,
      data: {
        line: mockData.tickets[line]?.name || line,
        fares: fareData
      }
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Fare data not found'
    });
  }
});

app.get('/api/routes', (req, res) => {
  const { from, to } = req.query;

  let routes = mockData.routes;

  if (from) {
    routes = routes.filter(route => route.from.toLowerCase().includes(from.toLowerCase()));
  }

  if (to) {
    routes = routes.filter(route => route.to.toLowerCase().includes(to.toLowerCase()));
  }

  res.json({
    success: true,
    data: routes
  });
});

app.post('/api/routes/plan', (req, res) => {
  const { from, to } = req.body;

  // Simulate route planning
  setTimeout(() => {
    const routes = mockData.routes.filter(route =>
      route.from.toLowerCase().includes(from.toLowerCase()) ||
      route.to.toLowerCase().includes(to.toLowerCase())
    );

    res.json({
      success: true,
      data: {
        from,
        to,
        routes: routes.length > 0 ? routes : mockData.routes.slice(0, 2),
        totalRoutes: routes.length > 0 ? routes.length : 2
      }
    });
  }, 1500); // Simulate planning delay
});

app.get('/api/rides/compare', (req, res) => {
  const { from, to } = req.query;

  // Real Mumbai transport comparison data
  const comparison = [
    {
      type: 'metro',
      name: 'Metro',
      duration: '21-32 min',
      fare: '₹22-40',
      stops: '12-27 stations',
      frequency: 'Every 3-8 min',
      lines: ['Line 1 (Blue)', 'Line 2A (Yellow)', 'Line 3 (Aqua)', 'Line 7 (Red)']
    },
    {
      type: 'auto',
      name: 'Auto-Rickshaw (CNG)',
      duration: '15-25 min',
      fare: '₹26-80',
      stops: 'Direct',
      frequency: 'On demand',
      minimumFare: '₹26 (first 1.5km)',
      perKmRate: '₹17.14'
    },
    {
      type: 'taxi',
      name: 'Kaali-Peeli Taxi (CNG)',
      duration: '15-25 min',
      fare: '₹31-90',
      stops: 'Direct',
      frequency: 'On demand',
      minimumFare: '₹31 (first 1.5km)',
      perKmRate: '₹20.66'
    },
    {
      type: 'coolcab',
      name: 'Cool Cab (AC Taxi)',
      duration: '15-25 min',
      fare: '₹48-120',
      stops: 'Direct',
      frequency: 'On demand',
      minimumFare: '₹48 (first 1.5km)',
      perKmRate: '₹37.20'
    },
    {
      type: 'aggregator',
      name: 'Uber/Ola (App-based)',
      duration: '15-25 min',
      fare: '₹40-150',
      stops: 'Direct',
      frequency: 'On demand',
      surgeCap: 'Max 1.5x base fare',
      driverShare: '80% of fare'
    }
  ];

  res.json({
    success: true,
    data: comparison,
    note: 'Fares are estimates and may vary based on distance, time, and demand. Night surcharge (+25%) applies from 12 AM to 5 AM.'
  });
});

app.get('/api/transport/fares', (req, res) => {
  res.json({
    success: true,
    data: mockData.transportFares,
    lastUpdated: 'September 2025',
    source: 'Mumbai RTO Official Rates'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
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

app.listen(PORT, () => {
  console.log(`🚀 Mumbai Transport API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});