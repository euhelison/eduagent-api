const mongoose = require('mongoose');

const estudanteSchema = new mongoose.Schema({
  nome: { 
    type: String, 
    required: true 
  },
  whatsapp: { 
    type: String, 
    required: true, 
    unique: true 
  },
  
  // Plano
  plano: { 
    type: String, 
    enum: ['trial', 'estudante', 'pro', 'cancelado'], 
    default: 'trial' 
  },
  trial_inicio: { 
    type: Date, 
    default: Date.now 
  },
  trial_fim: Date,
  
  // Stripe
  stripe_customer_id: String,
  stripe_subscription_id: String,
  stripe_status: String,
  
  // Uso
  sessoes_usadas_mes: { 
    type: Number, 
    default: 0 
  },
  ultimo_reset_sessoes: { 
    type: Date, 
    default: Date.now 
  },
  
  // Progresso
  total_sessoes: { 
    type: Number, 
    default: 0 
  },
  conceitos_dominados: [String],
  conceitos_em_progresso: [String],
  sequencia_dias: { 
    type: Number, 
    default: 0 
  },
  ultima_atividade: Date,
  
  criado_em: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Estudante', estudanteSchema);
