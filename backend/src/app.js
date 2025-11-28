const express = require('express');
const cors = require('cors');
const path = require('path');

require('./models/associations');
const clubesRoutes = require('./routes/clubes');
const jugadoresRoutes = require('./routes/jugadores');
const pasesRoutes = require('./routes/pases');
const partidosRoutes = require('./routes/partidos');

const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Rutas
app.use('/api/clubes', clubesRoutes);
app.use('/api/jugadores', jugadoresRoutes);
app.use('/api/pases', pasesRoutes);
app.use('/api/partidos', partidosRoutes);

module.exports = app;