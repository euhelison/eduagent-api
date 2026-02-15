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

      if (!nome || !whatsapp) {
        return res.status(400).json({ 
          erro: 'Nome e WhatsApp são obrigatórios' 
        });
      }

      // Verificar se o estudante já existe
      let estudante = await Estudante.findOne({ whatsapp });

      // Se já existe, faz login direto (SEM precisar de token)
      if (estudante) {
        return res.json({
          nome: estudante.nome,
          whatsapp: estudante.whatsapp,
          plano: estudante.plano,
          trial_fim: estudante.trial_fim,
          ja_cadastrado: true
        });
      }

      // Se NÃO existe, precisa de token para criar conta
      if (!token) {
        return res.status(400).json({ 
          erro: 'Token é obrigatório para novos cadastros' 
        });
      }

      // Verificar token
      const tokenDoc = await Token.findOne({ token });
      
      if (!tokenDoc) {
        return res.status(401).json({ erro: 'Token inválido' });
      }

      if (tokenDoc.usado) {
        return res.status(401).json({ erro: 'Token já foi utilizado' });
      }

      // Marcar token como usado
      tokenDoc.usado = true;
      tokenDoc.usado_por = whatsapp;
      tokenDoc.usado_em = new Date();
      await tokenDoc.save();

      // Criar novo estudante
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

      res.json({
        nome: estudante.nome,
        whatsapp: estudante.whatsapp,
        plano: estudante.plano,
        trial_fim: estudante.trial_fim,
        ja_cadastrado: false
      });
    } catch (erro) {
      console.error('Erro no login:', erro);
      res.status(500).json({ erro: 'Erro ao fazer login' });
    }
  }

  // Nova rota: Verificar se WhatsApp já existe
  async verificarWhatsapp(req, res) {
    try {
      const { whatsapp } = req.params;
      
      const estudante = await Estudante.findOne({ whatsapp });
      
      res.json({
        existe: !!estudante,
        nome: estudante?.nome || null
      });
    } catch (erro) {
      console.error('Erro ao verificar WhatsApp:', erro);
      res.status(500).json({ erro: 'Erro ao verificar WhatsApp' });
    }
  }
}

module.exports = new AuthController();
