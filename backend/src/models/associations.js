const Jugador = require('./Jugador');
const Club = require('./Club');
const Pase = require('./Pase');

//  Relación Jugador - Historial
// Un jugador tiene muchos pases
Jugador.hasMany(Pase, { foreignKey: 'jugadorId' });
// Un pase pertenece a un jugador
Pase.belongsTo(Jugador, { foreignKey: 'jugadorId' });

//  Relación Pase - Club Origen
// Un club tiene muchos pases de salida
Club.hasMany(Pase, { foreignKey: 'clubOrigenId', as: 'PasesSalida' });
// Un pase pertenece a un Club de Origen
Pase.belongsTo(Club, { foreignKey: 'clubOrigenId', as: 'ClubOrigen' });

//  Relación Pase - Club Destino
// Un club tiene muchos pases de entrada
Club.hasMany(Pase, { foreignKey: 'clubDestinoId', as: 'PasesEntrada' });
// Un pase pertenece a un Club de Destino
Pase.belongsTo(Club, { foreignKey: 'clubDestinoId', as: 'ClubDestino' });

module.exports = { Jugador, Club, Pase };