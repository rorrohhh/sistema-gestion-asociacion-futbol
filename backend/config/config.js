
module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql"
  },
  test: {
    // Usar la misma configuración para simplificar si no tienes una BD de test dedicada
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME + "_test", // Un nombre diferente es recomendado para test
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql"
  },
  production: {
    // La configuración de producción siempre debe ser gestionada por variables de entorno
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME + "_production", // Un nombre diferente es recomendado
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql"
  }
};