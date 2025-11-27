const express = require('express');
const cors = require('cors');

require('./models/associations');
const clubesRoutes = require('./routes/clubes');
const jugadoresRoutes = require('./routes/jugadores');
const pasesRoutes = require('./routes/pases');

const app = express();

// Middlewares
app.use(cors()); // Importante para que Next.js pueda pedir datos
app.use(express.json());

// Rutas
app.use('/api/clubes', clubesRoutes);
app.use('/api/jugadores', jugadoresRoutes);
app.use('/api/pases', pasesRoutes);

module.exports = app;