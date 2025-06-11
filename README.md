# Doctor AI - Assistente Médico com IA

Uma aplicação Next.js responsiva que grava consultas médicas, transcreve o áudio usando OpenAI Whisper e gera relatórios estruturados com GPT, tudo funcionando 100% no frontend.

## 🚀 Funcionalidades

- **Gravação de Áudio**: Interface intuitiva para gravar consultas médicas (máximo 5 minutos)
- **Transcrição Automática**: Usa OpenAI Whisper API para transcrever áudio em texto
- **Prompts Personalizáveis**: Interface para definir como a IA deve processar a transcrição
- **Geração de Relatórios**: Integração com OpenAI GPT para criar relatórios médicos estruturados
- **Interface Responsiva**: Design mobile-first com Tailwind CSS
- **Dark Mode**: Suporte completo a tema escuro/claro
- **Exportação**: Copiar texto ou baixar relatórios em formato .txt

## 🏗️ Arquitetura

O projeto segue princípios de Clean Architecture e SOLID:

```
src/
├── app/                    # Next.js App Router
├── components/ui/          # Componentes reutilizáveis
├── entities/              # Tipos e interfaces do domínio
├── features/              # Funcionalidades por módulo
│   ├── audio-recorder/
│   ├── prompt-form/
│   └── report-viewer/
├── services/              # Serviços externos (OpenAI)
└── shared/                # Utilitários e hooks compartilhados
    ├── hooks/
    ├── lib/
    └── providers/
```

## 🛠️ Tecnologias Utilizadas

- **Next.js 14** com App Router
- **TypeScript** para tipagem estática
- **Tailwind CSS** para estilização
- **React Hook Form** + **Zod** para validação de formulários
- **Lucide React** para ícones
- **OpenAI APIs** (Whisper + GPT)
- **MediaRecorder API** para gravação de áudio

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Chave de API da OpenAI

## 🚀 Instalação e Configuração

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/doctor-ai.git
cd doctor-ai
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure a API Key da OpenAI**
   
   A chave já está configurada no código para demonstração, mas em produção você deve:
   - Criar um arquivo `.env.local`
   - Adicionar: `OPENAI_API_KEY=sua_chave_aqui`
   - Atualizar o arquivo `src/services/openai.ts` para usar a variável de ambiente

4. **Execute o projeto**
```bash
npm run dev
```

5. **Acesse a aplicação**
   
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 📱 Como Usar

1. **Grave a Consulta**: Clique em "Iniciar Gravação" e grave o áudio da consulta médica
2. **Configure o Prompt**: Escolha um prompt pré-definido ou crie um personalizado
3. **Gere o Relatório**: A IA processará a transcrição e gerará o relatório
4. **Exporte o Resultado**: Copie o texto ou baixe como arquivo .txt

## 🎯 Prompts Disponíveis

- **Relatório Médico Geral**: Estrutura completa da consulta
- **Prescrição Médica**: Foco em medicamentos e tratamentos
- **Anamnese Estruturada**: Organização em formato de anamnese
- **Relatório de Retorno**: Para consultas de acompanhamento

## 🧪 Testes

Execute os testes com:

```bash
npm test
```

Para interface de testes:
```bash
npm run test:ui
```

## 🔒 Segurança e Privacidade

- A aplicação funciona completamente no frontend
- Áudios são processados diretamente pela API da OpenAI
- Não há armazenamento permanente de dados sensíveis
- Use apenas para fins de demonstração ou em ambiente controlado

## 🌟 Características Técnicas

### Responsividade
- Design mobile-first
- Componentes adaptativos para diferentes tamanhos de tela
- Interface otimizada para dispositivos móveis

### Acessibilidade
- Labels adequados para screen readers
- Navegação por teclado
- Contraste adequado entre cores
- Feedback visual e sonoro

### Performance
- Lazy loading de componentes
- Otimização de bundle com Next.js
- Estados de carregamento para melhor UX

## 📄 Licença

Este projeto é para fins educacionais e de demonstração.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## ⚠️ Avisos Importantes

- **Uso Médico**: Esta aplicação é apenas para demonstração. Sempre valide informações médicas com profissionais qualificados.
- **API Costs**: O uso das APIs da OpenAI gera custos. Monitore seu uso.
- **Privacidade**: Não use com dados reais de pacientes sem as devidas autorizações.

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório do GitHub.

---

Desenvolvido com ❤️ usando Next.js, TypeScript e OpenAI APIs.

## 🎯 Funcionalidades Principais

- **Gravação de Áudio**: Interface intuitiva para gravar ou fazer upload de arquivos de áudio (sem limite de tempo)
- **Transcrição Inteligente**: Transcrição automática usando OpenAI Whisper
- **Relatórios com IA**: Geração de relatórios personalizados com GPT-4o
- **Prompts Personalizados**: System prompts e instruções totalmente configuráveis
- **Suporte a Arquivos Grandes**: Processamento de arquivos e gravações de qualquer tamanho com chunking automático
- **Interface Responsiva**: Design adaptável para desktop e mobile
- **Modo Escuro**: Alternância entre temas claro e escuro
- **Progresso Visual**: Indicadores detalhados de progresso para cada etapa

## 🚀 Melhorias Recentes

### **GPT-4o Integration**
- Migração de GPT-3.5-turbo para **GPT-4o** (modelo mais recente e econômico)
- Temperature reduzida para 0.1 para maior consistência nas respostas
- Melhor seguimento das instruções dos prompts

### **Sistema de Prompts Unificado**
- **Prompts consolidados**: Todas as instruções agora são enviadas no System Prompt
- **Maior precisão**: As instruções específicas são melhor seguidas pela IA
- **Controle aprimorado**: System Prompt + Instruções específicas unificadas para máxima eficácia

### **Gravações Ilimitadas com Chunking Inteligente**
- **Sem limite de tempo**: Grave consultas de qualquer duração
- **Processamento automático**: Gravações longas são automaticamente divididas em segmentos
- **Compatibilidade garantida**: Sistema de chunking funciona para qualquer tamanho de áudio
- **Progresso detalhado**: Acompanhe cada etapa do processamento em tempo real 