const Estudante = require('../models/Estudante');
const mercadopagoService = require('../services/mercadopago.service');

class PagamentoController {
  async criarPagamento(req, res) {
    try {
      const { whatsapp, plano } = req.body;

      if (!whatsapp || !plano) {
        return res.status(400).json({ erro: 'WhatsApp e plano são obrigatórios' });
      }

      if (!['estudante', 'pro'].includes(plano)) {
        return res.status(400).json({ erro: 'Plano inválido' });
      }

      const estudante = await Estudante.findOne({ whatsapp });
      
      if (!estudante) {
        return res.status(404).json({ erro: 'Estudante não encontrado' });
      }

      const pagamento = await mercadopagoService.criarPagamento(
        estudante._id.toString(),
        plano,
        whatsapp
      );

      res.json({ 
        pagamentoUrl: pagamento.init_point,
        pagamentoId: pagamento.id
      });
    } catch (erro) {
      console.error('Erro ao criar pagamento:', erro);
      res.status(500).json({ erro: 'Erro ao criar pagamento' });
    }
  }

  async webhook(req, res) {
    try {
      console.log('📩 Webhook recebido:', JSON.stringify(req.body, null, 2));
      
      const { type, data, action } = req.body;

      // Responder OK imediatamente
      res.status(200).send('OK');

      // Processar notificação de pagamento
      if (type === 'payment' || action === 'payment.created' || action === 'payment.updated') {
        const paymentId = data?.id;
        
        if (!paymentId) {
          console.log('⚠️  Sem payment ID');
          return;
        }

        console.log('💳 Processando pagamento:', paymentId);

        // Buscar detalhes do pagamento no Mercado Pago
        const { MercadoPagoConfig, Payment } = require('mercadopago');
        const client = new MercadoPagoConfig({ 
          accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
        });
        const payment = new Payment(client);

        const paymentInfo = await payment.get({ id: paymentId });
        
        console.log('📄 Status do pagamento:', paymentInfo.status);
        console.log('📄 Metadata:', paymentInfo.metadata);

        // Se pagamento aprovado
        if (paymentInfo.status === 'approved') {
          const userId = paymentInfo.metadata?.user_id;
          const plano = paymentInfo.metadata?.plano;
          const whatsapp = paymentInfo.metadata?.whatsapp;

          console.log('✅ Pagamento aprovado!');
          console.log('👤 User ID:', userId);
          console.log('📦 Plano:', plano);
          console.log('📱 WhatsApp:', whatsapp);

          if (userId && plano) {
            const estudante = await Estudante.findByIdAndUpdate(
              userId,
              { 
                plano: plano,
                mercadopago_payment_id: paymentId,
                mercadopago_status: 'approved'
              },
              { new: true }
            );

            console.log('🎉 Plano ativado para:', estudante?.nome || userId);
          } else if (whatsapp && plano) {
            const estudante = await Estudante.findOneAndUpdate(
              { whatsapp },
              { 
                plano: plano,
                mercadopago_payment_id: paymentId,
                mercadopago_status: 'approved'
              },
              { new: true }
            );

            console.log('🎉 Plano ativado para WhatsApp:', whatsapp);
          }
        }
      }
    } catch (erro) {
      console.error('❌ Erro no webhook:', erro);
    }
  }

  async verificarLimites(req, res) {
    try {
      const { whatsapp } = req.params;
      
      const estudante = await Estudante.findOne({ whatsapp });
      
      if (!estudante) {
        return res.status(404).json({ erro: 'Estudante não encontrado' });
      }

      const agora = new Date();
      const limites = {
        trial: 5,
        estudante: 20,
        pro: -1
      };

      if (estudante.plano === 'trial') {
        if (estudante.trial_fim && agora > estudante.trial_fim) {
          return res.json({
            permitido: false,
            motivo: 'trial_expirado',
            mensagem: 'Seu período trial expirou. Assine um plano para continuar!'
          });
        }
        
        if (estudante.total_sessoes >= limites.trial) {
          return res.json({
            permitido: false,
            motivo: 'limite_trial',
            mensagem: `Você atingiu o limite de ${limites.trial} sessões do trial. Assine para continuar!`
          });
        }
      }

      if (estudante.plano === 'estudante') {
        const mesAtual = agora.getMonth();
        const anoAtual = agora.getFullYear();
        const ultimoReset = estudante.ultimo_reset_sessoes || new Date(0);
        
        if (ultimoReset.getMonth() !== mesAtual || ultimoReset.getFullYear() !== anoAtual) {
          await Estudante.findByIdAndUpdate(estudante._id, {
            sessoes_usadas_mes: 0,
            ultimo_reset_sessoes: agora
          });
          estudante.sessoes_usadas_mes = 0;
        }

        if (estudante.sessoes_usadas_mes >= limites.estudante) {
          return res.json({
            permitido: false,
            motivo: 'limite_mensal',
            mensagem: `Você atingiu o limite de ${limites.estudante} sessões deste mês. Upgrade para Pro!`
          });
        }
      }

      res.json({
        permitido: true,
        plano: estudante.plano,
        sessoes_restantes: estudante.plano === 'pro' 
          ? -1 
          : (estudante.plano === 'trial' 
              ? limites.trial - estudante.total_sessoes
              : limites.estudante - estudante.sessoes_usadas_mes)
      });
    } catch (erro) {
      console.error('Erro ao verificar limites:', erro);
      res.status(500).json({ erro: 'Erro ao verificar limites' });
    }
  }
}

module.exports = new PagamentoController();
