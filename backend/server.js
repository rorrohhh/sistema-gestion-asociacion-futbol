const app = require('./src/app');
const sequelize = require('./src/config/database');

// Importamos modelos para definir relaciones
const Club = require('./src/models/Club');
const Jugador = require('./src/models/Jugador');
const Pase = require('./src/models/Pase');
// Definir Relaciones (Associations)
Club.hasMany(Jugador, { foreignKey: 'clubId' });
Jugador.belongsTo(Club, { foreignKey: 'clubId' });

const PORT = process.env.PORT || 4000;

async function main() {
    try {
        // force: false -> Crea tablas si no existen. NO borra datos.
        // force: true  -> BORRA todo y crea tablas de cero (útil para desarrollo inicial).
        await sequelize.sync({ force: false }); 
        console.log("✅ Base de datos sincronizada");

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Error al iniciar servidor:", error);
    }
}

main();