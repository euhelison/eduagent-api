const { MercadoPagoConfig, Preference } = require('mercadopago');

class MercadoPagoService {
  constructor() {
    this.client = new MercadoPagoConfig({ 
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
    });
    this.preference = new Preference(this.client);
  }

  async criarPagamento(userId, plano, whatsapp) {
    const planos = {
      estudante: {
        titulo: 'Plano Estudante',
        preco: 79.90
      },
      pro: {
        titulo: 'Plano Pro - Ilimitado',
        preco: 149.90
      }
    };

    const dadosPlano = planos[plano];

    const preferenceData = {
      items: [
        {
          title: dadosPlano.titulo,
          quantity: 1,
          unit_price: dadosPlano.preco,
          currency_id: 'BRL'
        }
      ],
      back_urls: {
        success: `${process.env.FRONTEND_URL}/sucesso`,
        failure: `${process.env.FRONTEND_URL}/planos`,
        pending: `${process.env.FRONTEND_URL}/pendente`
      },
      auto_return: 'approved',
      external_reference: `${userId}_${plano}`,
      notification_url: `${process.env.BACKEND_URL || 'https://seu-backend.railway.app'}/api/pagamento/webhook`,
      metadata: {
        user_id: userId,
        plano: plano,
        whatsapp: whatsapp
      }
    };

    const preference = await this.preference.create({ body: preferenceData });
    
    return {
      id: preference.id,
      init_point: preference.init_point, // Link de pagamento
      sandbox_init_point: preference.sandbox_init_point
    };
  }
}

module.exports = new MercadoPagoService();
