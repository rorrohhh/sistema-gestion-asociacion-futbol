require('dotenv').config();
const expressLayouts = require('express-ejs-layouts');
const express = require('express');
const path = require('path');
const app = express();

//  Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ACTIVAR LAYOUTS (¡IMPORTANTE!)
app.use(expressLayouts);
app.set('layout', 'layout'); // Indica que busque "layout.ejs" por defecto

//  Carpeta Pública
app.use(express.static(path.join(__dirname, 'public')));

//  Middlewares para datos
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//  RUTAS (Al final de la configuración)
app.use('/', require('./routes/index'));

// --- INICIAR SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});