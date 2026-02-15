const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

// Buscar histórico
router.get('/mensagens/:whatsapp', (req, res) => {
  chatController.buscarHistorico(req, res);
});

// Enviar mensagem
router.post('/mensagens', (req, res) => {
  chatController.enviarMensagem(req, res);
});

// Limpar histórico
router.delete('/mensagens/:whatsapp', (req, res) => {
  chatController.limparHistorico(req, res);
});

module.exports = router;
