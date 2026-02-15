require('dotenv').config();
const mongoose = require('mongoose');

async function limpar() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado');
    
    const db = mongoose.connection.db;
    const collection = db.collection('estudantes');
    
    // Deletar todos os registros (limpar banco)
    const resultado = await collection.deleteMany({});
    console.log(`✅ ${resultado.deletedCount} registros deletados`);
    
    // Deletar índices antigos
    try {
      await collection.dropIndexes();
      console.log('✅ Todos os índices deletados');
    } catch (e) {
      console.log('ℹ️  Índices já foram deletados');
    }
    
    // Criar índice correto
    await collection.createIndex({ whatsapp: 1 }, { unique: true });
    console.log('✅ Índice whatsapp criado');
    
    console.log('\n🎉 Banco limpo e pronto!');
    process.exit(0);
  } catch (erro) {
    console.error('❌ Erro:', erro);
    process.exit(1);
  }
}

limpar();
