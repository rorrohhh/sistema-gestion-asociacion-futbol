const express = require('express');
const cors = require('cors');
const path = require('path');

require('./models/associations');
const clubesRoutes = require('./routes/clubes');
const jugadoresRoutes = require('./routes/jugadores');
const pasesRoutes = require('./routes/pases');

const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Rutas
app.use('/api/clubes', clubesRoutes);
app.use('/api/jugadores', jugadoresRoutes);
app.use('/api/pases', pasesRoutes);

module.exports = app;