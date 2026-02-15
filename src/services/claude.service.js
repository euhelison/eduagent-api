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
      const messages = [];
      
      const historicoRecente = historico.slice(-10);
      for (const msg of historicoRecente) {
        messages.push({
          role: msg.tipo === 'estudante' ? 'user' : 'assistant',
          content: msg.conteudo || ''
        });
      }
      
      messages.push({
        role: 'user',
        content: mensagemEstudante
      });

      const response = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
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
