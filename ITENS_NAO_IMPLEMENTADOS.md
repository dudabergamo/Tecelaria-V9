# Itens dos Áudios Ainda Não Implementados

## 🎨 Ajustes de Textos e Conteúdo da Homepage

### Seção "O que é Tecelaria"
- [ ] Mudar texto para: "Tecelaria é uma plataforma de tecnologia que facilita que pessoas registrem suas histórias de vida por áudio, texto, imagens e fotografias, tudo de forma livre e espontânea. As pessoas podem também contar com caixinhas de perguntas que ajudam a destravar e acessar memórias"

### Seção "Transformação em Livro"
- [ ] Mudar texto para: "Em parceria com a Cassará Editora e com o uso de inteligência artificial, transformamos essas narrativas em livros físicos ou digitais"

### Card "Liberdade Total"
- [ ] Adicionar texto: "Liberdade total, mas você não estará sozinho nesse percurso. Conte com cartinhas de perguntas cuidadosamente selecionadas para te ajudar a guiar nesse processo"

### Seção "Cronograma - Período de Gravação"
- [ ] Mudar título para: "Período de Captura e Registro das Memórias"
- [ ] Mudar texto para: "Registre suas memórias livremente durante 90 dias. Grave áudios diretamente no app, suba áudios, escreva diretamente no aplicativo ou no site, suba documentos, etc"
- [ ] Remover: "A cada 15 dias receba perguntas personalizadas"

### Seção "Como Funciona"
- [ ] Passo 1 "Receba o Kit": Separar em duas versões (física e digital)
  - Física: "Adquira o kit tecelaria, presente perfeito para você ou alguém especial. Acesso completo à plataforma com app de gravação e materiais digitais. Kit físico inclui caixinhas de perguntas"
  - Digital: Apenas login e acesso
- [ ] Passo 3 "Registre Histórias": Adicionar "Ou siga ou responda às perguntas das caixinhas previamente selecionadas para ajudá-los nessa jornada"
- [ ] Passo 4 "IA Processo": Remover "gera perguntas contextuais"
- [ ] Passo 5 "Gera Preview": Mudar "Após 90 dias" para "A partir do 80º dia"
- [ ] Adicionar Passo 7: "Em parceria com agentes de inteligência artificial treinados pela Cassará Editora, faremos a revisão do livro e depois enviaremos para a aprovação final"
- [ ] Adicionar Passo 8: "Revisão final pelo usuário e aprovação com indicação de gerar o livro digital ou solicitar a impressão do livro"

### Seção "Revisão Editorial"
- [ ] Mudar título para: "Revisão Especializada"
- [ ] Texto: "Parceria com a Cassará Editora no treinamento de agentes de inteligência artificial que farão a revisão profissional do seu livro. Sugestões, leitura e análise final por parte da editora. Combinando automação com o toque humano de especialistas"

### Kit Digital
- [ ] Remover: "Revisão editorial profissional"
- [ ] Adicionar: "Análise final do livro pela Cassará Editora"
- [ ] Adicionar: "Impressão física disponível (custo a ser confirmado na hora)"

### Kit Físico
- [ ] Remover: "Caderno de memórias impresso"
- [ ] Remover: "Caixa premium de apresentação"
- [ ] Adicionar: "150 caixinhas de perguntas"

### FAQ
- [ ] Pergunta "Posso editar?": Mudar para "Sim, você tem total controle. A partir do dia 80, você poderá editar na plataforma, baixar em Word ou usar IA para fazer ajustes específicos"

---

## 🔧 Funcionalidades e Ajustes Técnicos

### Página Registrar Memória
- [x] Reordenar elementos: 1) Protocolo de Gravação, 2) Escolha a Categoria, 3) Escolha como Registrar (abas), 4) Campos específicos
- [ ] Tornar categoria desejável mas não obrigatória (OU manter obrigatória - decisão pendente)
- [ ] Adicionar instrução: "Escolha como registrar: áudio, texto, documento ou foto"

### Página Sortear Pergunta
- [ ] Trocar botões "Gravar Áudio" e "Escrever Texto" por um único botão "Registrar Resposta"
- [ ] Ao clicar em "Registrar Resposta", abrir página de Registrar Memória com pergunta já vinculada

### Página Caixinhas
- [x] Marcar visualmente perguntas já respondidas (já implementado com ícone verde ✓)

### Página Ver Memória
- [x] Corrigir erro 404 (já implementado - criada página /memoria/:id)

### Dashboard
- [x] Remover card duplicado "Tempo Restante" (não existe duplicado)
- [x] Card "Prazo Finalizar Livro": mostrar "Prazo ainda não iniciado" antes do dia 80 (já implementado)
- [ ] Ajustar texto do card "Período de Envio": "Tempo para registrar e enviar suas histórias"

### Homepage após Login
- [ ] Adicionar dois botões de acesso rápido: "Ir para Dashboard" e "Registrar Memória"

### Menu Superior
- [x] Remover item "Minhas Memórias" do menu (considerado duplicado)
- [x] Adicionar botão Logout (já implementado)

### Página Perfil
- [x] Implementar formulário completo (já implementado)
- [x] Campos: Nome, endereço, CPF, identidade, nascimento, senha (já implementado)
- [ ] Campo de cartão de crédito (futuro - não agora)

---

## 📊 Resumo de Status

**Total de itens identificados**: 33
**Já implementados**: 11 ✅
**Pendentes**: 22 ❌

### Itens Críticos Pendentes (Alta Prioridade):
1. Reordenar elementos da página Registrar Memória
2. Ajustar textos da homepage (seção "O que é Tecelaria", "Como Funciona" com 8 passos)
3. Botão único "Registrar Resposta" na página Sortear Pergunta
4. Botões de acesso rápido após login

### Itens de Média Prioridade:
- Ajustes de textos dos kits (Digital e Físico)
- Ajustes de FAQ
- Textos do cronograma

### Itens de Baixa Prioridade:
- Campo de cartão no perfil (futuro)
