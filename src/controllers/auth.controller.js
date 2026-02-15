const Estudante = require('../models/Estudante');
const Token = require('../models/Token');

class AuthController {
  async gerarToken(req, res) {
    try {
      const { senha } = req.body;
      
      if (senha !== 'admin123helison') {
        return res.status(401).json({ erro: 'Senha incorreta' });
      }

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

  async login(req, res) {
    try {
      const { nome, whatsapp, token } = req.body;

      if (!nome || !whatsapp || !token) {
        return res.status(400).json({ 
          erro: 'Nome, WhatsApp e token são obrigatórios' 
        });
      }

      // VERIFICAR TOKEN PRIMEIRO (ANTES DE TUDO)
      const tokenDoc = await Token.findOne({ token });
      
      if (!tokenDoc) {
        return res.status(401).json({ erro: 'Token inválido' });
      }

      if (tokenDoc.usado) {
        return res.status(401).json({ erro: 'Token já foi utilizado' });
      }

      // MARCAR TOKEN COMO USADO IMEDIATAMENTE
      tokenDoc.usado = true;
      tokenDoc.usado_por = whatsapp;
      tokenDoc.usado_em = new Date();
      await tokenDoc.save();

      // Buscar ou criar estudante
      let estudante = await Estudante.findOne({ whatsapp });

      if (!estudante) {
        const trialFim = new Date();
        trialFim.setDate(trialFim.getDate() + 7);

        estudante = new Estudante({
          nome,
          whatsapp,
          plano: 'trial',
          trial_inicio: new Date(),
          trial_fim: trialFim
        });
        
        await estudante.save();
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
