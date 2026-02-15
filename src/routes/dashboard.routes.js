const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

// Buscar progresso
router.get('/progresso/:whatsapp', (req, res) => {
  dashboardController.buscarProgresso(req, res);
});

module.exports = router;
