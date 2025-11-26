require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

// --- CONFIGURACIÓN ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Middlewares (para entender los formularios)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// --- IMPORTAR RUTAS ---
app.use('/', require('./routes/index'));

// --- INICIAR SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});