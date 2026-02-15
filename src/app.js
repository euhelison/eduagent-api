const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const pagamentoRoutes = require('./routes/pagamento.routes');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3002',
    'http://localhost:3001',
    'http://localhost:3000',
    'https://agenteeducacional.com',
    'https://www.agenteeducacional.com'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/pagamento', pagamentoRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'EduAgent API',
    status: 'online',
    version: '2.0.0'
  });
});

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

module.exports = app;
