const express = require('express');
const path = require('path');
const app = express();

// --- CONFIGURACIÓN ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares (para entender los formularios)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// --- IMPORTAR RUTAS ---
app.use('/', require('./routes/index'));

// --- INICIAR SERVIDOR ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor ordenado corriendo en http://localhost:${PORT}`);
});