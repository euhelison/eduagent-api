require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado');
    
    const db = mongoose.connection.db;
    const collection = db.collection('estudantes');
    
    // Deletar índice antigo
    try {
      await collection.dropIndex('whatsappId_1');
      console.log('✅ Índice whatsappId_1 deletado');
    } catch (e) {
      console.log('ℹ️  Índice não existe ou já foi deletado');
    }
    
    // Criar índice correto
    await collection.createIndex({ whatsapp: 1 }, { unique: true });
    console.log('✅ Índice whatsapp criado');
    
    process.exit(0);
  } catch (erro) {
    console.error('❌ Erro:', erro);
    process.exit(1);
  }
}

fixIndex();
