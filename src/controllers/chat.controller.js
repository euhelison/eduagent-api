const Mensagem = require('../models/Mensagem');
const Estudante = require('../models/Estudante');
const claudeService = require('../services/claude.service');

class ChatController {
  // Buscar histórico
  async buscarHistorico(req, res) {
    try {
      const { whatsapp } = req.params;
      
      const mensagens = await Mensagem
        .find({ estudante_whatsapp: whatsapp })
        .sort({ timestamp: 1 })
        .limit(100);

      res.json(mensagens);
    } catch (erro) {
      console.error('Erro ao buscar histórico:', erro);
      res.status(500).json({ erro: 'Erro ao buscar histórico' });
    }
  }

  // Enviar mensagem
  async enviarMensagem(req, res) {
    try {
      const { whatsapp, conteudo, arquivo } = req.body;

      if (!whatsapp || !conteudo) {
        return res.status(400).json({ 
          erro: 'WhatsApp e conteúdo são obrigatórios' 
        });
      }

      // Salvar mensagem do estudante
      const mensagemEstudante = new Mensagem({
        estudante_whatsapp: whatsapp,
        tipo: 'estudante',
        conteudo,
        arquivo
      });
      await mensagemEstudante.save();

      // Buscar histórico
      const historico = await Mensagem
        .find({ estudante_whatsapp: whatsapp })
        .sort({ timestamp: 1 })
        .limit(20);

      // Processar com Claude
      const respostaAgente = await claudeService.chat(conteudo, historico);

      // Salvar resposta do agente
      const mensagemAgente = new Mensagem({
        estudante_whatsapp: whatsapp,
        tipo: 'agente',
        conteudo: respostaAgente
      });
      await mensagemAgente.save();

      // Atualizar progresso do estudante
      await Estudante.findOneAndUpdate(
        { whatsapp },
        { 
          $inc: { total_sessoes: 1 },
          ultima_atividade: new Date()
        }
      );

      res.json({
        mensagemEstudante,
        mensagemAgente
      });
    } catch (erro) {
      console.error('Erro ao enviar mensagem:', erro);
      res.status(500).json({ erro: 'Erro ao enviar mensagem' });
    }
  }

  // Limpar histórico
  async limparHistorico(req, res) {
    try {
      const { whatsapp } = req.params;
      
      await Mensagem.deleteMany({ estudante_whatsapp: whatsapp });

      res.json({ sucesso: true });
    } catch (erro) {
      console.error('Erro ao limpar histórico:', erro);
      res.status(500).json({ erro: 'Erro ao limpar histórico' });
    }
  }
}

module.exports = new ChatController();
