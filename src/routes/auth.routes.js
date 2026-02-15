const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/gerar-token', (req, res) => {
  authController.gerarToken(req, res);
});

router.post('/login', (req, res) => {
  authController.login(req, res);
});

router.get('/verificar/:whatsapp', (req, res) => {
  authController.verificarWhatsapp(req, res);
});

module.exports = router;
