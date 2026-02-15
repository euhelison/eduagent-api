const Estudante = require('../models/Estudante');
const Mensagem = require('../models/Mensagem');

class DashboardController {
  async buscarProgresso(req, res) {
    try {
      const { whatsapp } = req.params;
      
      const estudante = await Estudante.findOne({ whatsapp });
      
      if (!estudante) {
        return res.status(404).json({ erro: 'Estudante não encontrado' });
      }

      // Contar mensagens
      const totalMensagens = await Mensagem.countDocuments({ 
        estudante_whatsapp: whatsapp 
      });

      // Calcular dias de trial restantes
      let diasTrialRestantes = 0;
      if (estudante.plano === 'trial' && estudante.trial_fim) {
        const diff = estudante.trial_fim - new Date();
        diasTrialRestantes = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      }

      res.json({
        nome: estudante.nome,
        plano: estudante.plano,
        total_sessoes: estudante.total_sessoes,
        sequencia_dias: estudante.sequencia_dias,
        conceitos_dominados: estudante.conceitos_dominados || [],
        conceitos_em_progresso: estudante.conceitos_em_progresso || [],
        total_mensagens: totalMensagens,
        dias_trial_restantes: diasTrialRestantes,
        ultima_atividade: estudante.ultima_atividade
      });
    } catch (erro) {
      console.error('Erro ao buscar progresso:', erro);
      res.status(500).json({ erro: 'Erro ao buscar progresso' });
    }
  }
}

module.exports = new DashboardController();
