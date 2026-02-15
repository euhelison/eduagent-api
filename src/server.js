require('dotenv').config();
const app = require('./app');
const databaseService = require('./services/database.service');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    // Conectar MongoDB
    await databaseService.connect();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║                                        ║
║       🚀 EDUAGENT API ONLINE 🚀       ║
║                                        ║
║   Porta: ${PORT}                         ║
║   Ambiente: ${process.env.NODE_ENV || 'development'}              ║
║                                        ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (erro) {
    console.error('❌ Erro ao iniciar servidor:', erro);
    process.exit(1);
  }
}

start();
