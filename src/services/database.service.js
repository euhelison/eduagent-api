const mongoose = require('mongoose');

class DatabaseService {
  async connect() {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB conectado');
    } catch (erro) {
      console.error('❌ Erro ao conectar MongoDB:', erro);
      process.exit(1);
    }
  }
}

module.exports = new DatabaseService();
