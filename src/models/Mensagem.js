const mongoose = require('mongoose');

const mensagemSchema = new mongoose.Schema({
  estudante_whatsapp: {
    type: String,
    required: true,
    index: true
  },
  tipo: {
    type: String,
    enum: ['estudante', 'agente'],
    required: true
  },
  conteudo: String,
  arquivo: {
    tipo: String,
    conteudo: String,
    nome: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Índice para buscar mensagens por whatsapp rapidamente
mensagemSchema.index({ estudante_whatsapp: 1, timestamp: -1 });

module.exports = mongoose.model('Mensagem', mensagemSchema);
