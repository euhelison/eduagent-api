const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  usado: {
    type: Boolean,
    default: false
  },
  usado_por: String,
  criado_em: {
    type: Date,
    default: Date.now
  },
  usado_em: Date
});

module.exports = mongoose.model('Token', tokenSchema);
