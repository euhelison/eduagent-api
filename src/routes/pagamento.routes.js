const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamento.controller');

router.post('/criar', (req, res) => {
  pagamentoController.criarPagamento(req, res);
});

router.get('/limites/:whatsapp', (req, res) => {
  pagamentoController.verificarLimites(req, res);
});

router.post('/webhook', (req, res) => {
  pagamentoController.webhook(req, res);
});

module.exports = router;
