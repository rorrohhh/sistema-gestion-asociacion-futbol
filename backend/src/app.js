const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors()); // Importante para que Next.js pueda pedir datos
app.use(express.json());

// Rutas
app.use('/api/clubes', require('./routes/clubes'));
app.use('/api/jugadores', require('./routes/jugadores'));

module.exports = app;