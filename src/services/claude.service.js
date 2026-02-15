const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

class ClaudeService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    
    this.skillContent = this.loadSkill();
  }

  loadSkill() {
    try {
      const skillPath = path.join(__dirname, '../skills/SKILL.md');
      const content = fs.readFileSync(skillPath, 'utf-8');
      console.log(`✅ Skill carregada: ${content.length} caracteres`);
      return content;
    } catch (erro) {
      console.error('❌ Erro ao carregar skill:', erro);
      return '';
    }
  }

  async chat(mensagemEstudante, historico = []) {
    try {
      // Construir histórico de mensagens
      const messages = [];
      
      // Adicionar histórico (últimas 10 mensagens)
      const historicoRecente = historico.slice(-10);
      for (const msg of historicoRecente) {
        messages.push({
          role: msg.tipo === 'estudante' ? 'user' : 'assistant',
          content: msg.conteudo || ''
        });
      }
      
      // Adicionar mensagem atual
      messages.push({
        role: 'user',
        content: mensagemEstudante
      });

      // Chamar Claude
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: this.skillContent,
        messages: messages
      });

      return response.content[0].text;
    } catch (erro) {
      console.error('❌ Erro ao chamar Claude:', erro);
      throw new Error('Erro ao processar mensagem');
    }
  }
}

module.exports = new ClaudeService();
