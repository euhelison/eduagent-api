const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Gerar token (admin)
router.post('/gerar-token', (req, res) => {
  authController.gerarToken(req, res);
});

// Login
router.post('/login', (req, res) => {
  authController.login(req, res);
});

module.exports = router;
