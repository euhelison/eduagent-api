const Estudante = require('../models/Estudante');
const Token = require('../models/Token');

class AuthController {
  // Gerar token (admin)
  async gerarToken(req, res) {
    try {
      const { senha } = req.body;
      
      if (senha !== 'admin123helison') {
        return res.status(401).json({ erro: 'Senha incorreta' });
      }

      // Gerar token aleatório
      const token = Math.random().toString(36).substring(2) + 
                    Math.random().toString(36).substring(2);
      
      const novoToken = new Token({ token });
      await novoToken.save();

      res.json({ token: novoToken.token });
    } catch (erro) {
      console.error('Erro ao gerar token:', erro);
      res.status(500).json({ erro: 'Erro ao gerar token' });
    }
  }

  // Login
  async login(req, res) {
    try {
      const { nome, whatsapp, token } = req.body;

      if (!nome || !whatsapp || !token) {
        return res.status(400).json({ 
          erro: 'Nome, WhatsApp e token são obrigatórios' 
        });
      }

      // Verificar token
      const tokenDoc = await Token.findOne({ token, usado: false });
      
      if (!tokenDoc) {
        return res.status(401).json({ erro: 'Token inválido ou já utilizado' });
      }

      // Buscar ou criar estudante
      let estudante = await Estudante.findOne({ whatsapp });

      if (!estudante) {
        // Criar novo estudante
        const trialFim = new Date();
        trialFim.setDate(trialFim.getDate() + 7); // 7 dias de trial

        estudante = new Estudante({
          nome,
          whatsapp,
          plano: 'trial',
          trial_inicio: new Date(),
          trial_fim: trialFim
        });
        
        await estudante.save();

        // Marcar token como usado
        tokenDoc.usado = true;
        tokenDoc.usado_por = whatsapp;
        tokenDoc.usado_em = new Date();
        await tokenDoc.save();
      }

      res.json({
        nome: estudante.nome,
        whatsapp: estudante.whatsapp,
        plano: estudante.plano,
        trial_fim: estudante.trial_fim
      });
    } catch (erro) {
      console.error('Erro no login:', erro);
      res.status(500).json({ erro: 'Erro ao fazer login' });
    }
  }
}

module.exports = new AuthController();
